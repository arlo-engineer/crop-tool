# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Batch image cropping and resizing service built with Next.js 15 (App Router). Processes up to 100 images at once with person detection (TensorFlow.js) and smart cropping, outputting to user-specified dimensions (default: 640×800px). No authentication required.

**Tech Stack:** Next.js 15.5, TypeScript, Sharp (image processing), TensorFlow.js (person detection), Cloudflare R2 (storage), Supabase (metadata), Biome (linting).

## Development Commands

### Docker-based Development (Recommended)

```bash
# First-time setup: Build dev container and copy node_modules
make init

# Start development server + Supabase local instance
make up
# → http://localhost:3000 (app)
# → http://localhost:54321 (Supabase Studio)

# Stop development environment
make down

# Run linter/formatter inside container
make check

# Run E2E tests (Playwright)
make test
```

### Direct npm Commands (Alternative)

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Production server
npm run check     # Biome lint & format
npm run test:e2e  # Playwright E2E tests
```

## Architecture

### Image Processing Pipeline

```
Client (selects up to 100 images)
    ↓ Chunks via createSmartChunks() (dynamic batch size)
Server Action: processImages() → Promise.all() parallel processing
    ↓ Sharp: crop + resize (per image)
Upload to Cloudflare R2 (processed images only)
    ↓ Accumulate in sessionCache (Map<sessionId, metadata[]>)
Server Action: flushImagesToDB()
    ↓ Bulk insert to Supabase
Server Action: getMultipleSignedUrls()
    ↓ Generate R2 signed URLs (1hr expiry)
Client: Download as ZIP
```

**Key Architectural Decisions:**

1. **Session Cache Pattern:** `lib/cache/sessionCache.ts` stores image metadata in memory during batch processing, then bulk-writes to Supabase via `flushImagesToDB()` to minimize DB writes.

2. **R2 Storage Path:** `{dev|prod}/sessions/{sessionId}/processed/{fileName}`
   - Prefix auto-switches via `APP_ENV` environment variable
   - Only processed images stored (not originals) to save costs
   - Managed by `R2PathManager` in `lib/storage/r2-path.ts`

3. **Person Detection:** `lib/utils/personDetector.ts` uses COCO-SSD model
   - When `crop.strategy: 'person'`, centers crop on detected person
   - Auto-fallback to `'center'` strategy if detection fails
   - Model cached in memory via `modelCache` singleton

4. **Server Action Constraints:**
   - `next.config.ts` sets `serverActions.bodySizeLimit: "30mb"`
   - Images sent in chunks via `createSmartChunks()` (dynamic batch sizing based on file sizes)
   - Fallback: `createFixedChunks()` with `CHUNK_SIZE: 1` if smart chunking fails
   - Each `processImages()` call processes its chunk in parallel via `Promise.all()`

### Database Schema (Supabase)

**images table:**
- `session_id`: Groups images from same batch
- `original_name`: Original filename
- `processed_name`: Output filename (extension may change based on outputFormat)
- `processed_r2_key`: R2 storage key
- `status`: 'processing' | 'completed' | 'error'
- `error_message`: Populated on processing failure

**Migrations:** `supabase/migrations/*.sql` applied via `npx supabase@2.51.0 start` (runs automatically in `make up`)

### Module Responsibilities

**Server Actions (`app/actions/`):**
- `process.ts::processImages()`: Validates, processes (Sharp), uploads to R2, adds to cache
- `process.ts::flushImagesToDB()`: Bulk saves cached metadata to Supabase
- `download.ts::getMultipleSignedUrls()`: Generates R2 signed URLs for download

**Image Processing (`lib/utils/`):**
- `imageProcessor.ts`: Core Sharp operations (resize, crop, metadata extraction)
- `personDetector.ts`: TensorFlow.js COCO-SSD model integration
- `thumbnailGenerator.ts`: Creates compressed thumbnails for UI preview
- `chunkOptimizer.ts`: Calculates optimal batch sizes for processing

**Configuration (`lib/constants/config.ts`):**
```typescript
CONFIG = {
  CHUNK_SIZE: 1,              // Fallback chunk size for createFixedChunks()
  MAX_FILES: 100,
  MAX_FILE_SIZE: 4 * 1024 * 1024,  // 4MB
  IMAGE_PROCESSING: {
    DEFAULT_WIDTH: 640,
    DEFAULT_HEIGHT: 800,
    QUALITY: 85,
    FORMAT: 'jpeg',
    CROP_STRATEGY: 'center',   // 'center' | 'custom' | 'person'
  }
}
```

## Important Implementation Notes

### Output Format Handling

When `outputFormat: 'original'`, preserves original image format (JPEG/PNG/WebP). Otherwise converts to specified format and updates file extension:

```typescript
const actualFormat = outputFormat === 'original'
  ? originalMetadata.format
  : outputFormat;
const processedFileName = file.name.replace(/\.[^/.]+$/, `.${actualFormat}`);
```

### TensorFlow.js Webpack Configuration

`next.config.ts` externalizes TensorFlow.js for server-side usage:

```typescript
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push({
      '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
    });
  }
  return config;
}
```

### Environment Variables

Required in `.env.local`:
```bash
APP_ENV=development        # or 'production' (controls R2 path prefix)
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_ENDPOINT=https://....r2.cloudflarestorage.com
R2_BUCKET_NAME=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Both `lib/storage/r2.ts` and `lib/db/supabase.ts` throw errors at startup if credentials missing.

## Code Style

- **Biome formatter:** Tab indentation, double quotes (`biome.json`)
- **Comments:** English only
- **UI text:** Use constants from `lib/constants/text.ts` (currently Japanese, designed for easy i18n)
- **Type safety:** Strict TypeScript, all functions explicitly typed
- **Server Actions:** Must use `"use server"` directive

## Testing

**E2E Tests (Playwright):**
- Test directory: `tests/e2e/`
- Fixtures: `tests/fixtures/` (sample images for testing)
- Test helpers: `tests/helpers/zipValidator.ts` (validates ZIP structure and image dimensions)
- Configuration: `playwright.config.ts` (timeout: 180s, workers: 1, no parallel execution)

**Key test scenarios:**
- Full flow: upload → process → download ZIP → validate dimensions
- Person detection with center-crop fallback
- Output format conversion (JPEG/PNG/WebP)

## Performance Considerations

- **Sharp memory usage:** Each image processed server-side (watch memory limits on deployment platforms)
- **R2 uploads:** Already parallelized via `Promise.all()` in upload functions
- **Session cache:** Clear via `flushImagesToDB()` after batch completion to avoid memory leaks
- **TensorFlow.js model:** Lazy-loaded and cached; first detection slower due to model download
