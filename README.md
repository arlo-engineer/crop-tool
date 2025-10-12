# Crop Tool

Image cropping and resizing service - Batch process up to 100 images with automatic cropping and resizing using person detection.

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript&logoColor=white)
![Sharp](https://img.shields.io/badge/Sharp-0.34-green?style=flat)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-orange?style=flat&logo=tensorflow&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_R2-Storage-F38020?style=flat&logo=cloudflare&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase&logoColor=white)

## Getting Started

### Environment Variables

Create `.env.local` based on `.env.example`

### Development

```bash
# First time only: Initial setup
make init

# Start development environment
make up

# Stop development environment
make down
```

Development server: http://localhost:3000

### Deployment

```bash
# Build production image
make build

# Deploy to Cloud Run
gcloud builds submit --config cloudbuild.yaml
```

## Commands

```bash
make init     # Initial setup
make up       # Start development
make down     # Stop development
make build    # Build for production
npm run check # Lint & Format
```
