# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

画像トリミング・リサイズサービス - Next.js 15 (App Router) で構築された、認証不要の画像処理 Web アプリケーション。最大 100 枚の画像を一括処理し、ユーザーが選択したサイス（デフォルトは 640×800px）にリサイズしてダウンロード可能。

**主要技術スタック:**

- Next.js 15.5.3 (App Router)
- TypeScript
- Sharp (サーバーサイド画像処理)
- Cloudflare R2 (画像ストレージ)
- Supabase (メタデータ管理)
- Biome (Linter/Formatter)

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# Lintとフォーマット (Biome)
npm run check
```

## 環境変数設定

`.env.example`を参考に`.env.local`を作成:

```bash
APP_ENV=development  # または production

# Cloudflare R2
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_BUCKET_NAME=your-bucket-name

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## アーキテクチャ

### 画像処理フロー

```
クライアント (最大100枚選択)
    ↓
Server Action: processImages() (1枚ずつ処理)
    ↓
Sharp処理 (リサイズ・クロップ)
    ↓
Cloudflare R2保存 (処理済み画像のみ)
    ↓
セッションキャッシュ蓄積
    ↓
flushImagesToDB() でSupabaseに一括保存
    ↓
Server Action: getMultipleSignedUrls()
    ↓
クライアントでZIP生成・ダウンロード
```

### セッションキャッシュパターン

**重要:** DB への書き込み負荷を軽減するため、処理中はメモリキャッシュを使用し、全処理完了後に一括で Supabase に保存する。

- **lib/cache/sessionCache.ts**: `Map<sessionId, UploadedImageMetadata[]>`でメタデータを一時保管
- **app/actions/process.ts**:
  - `processImages()`: 画像処理後、`sessionCache.addImage()`でキャッシュに追加
  - `flushImagesToDB()`: 全処理完了後、キャッシュから Supabase へ一括保存

### R2 ストレージ構成

**パス構造:**

```
{dev|prod}/sessions/{sessionId}/processed/{fileName}
```

**R2PathManager (lib/storage/r2-path.ts):**

- 環境変数`APP_ENV`で`dev`/`prod`を自動切り替え
- セッション ID ごとにディレクトリを分離
- オリジナル画像は保存せず、処理済み画像のみ保存してコスト削減

### データベース構造 (Supabase)

**images テーブル:**

```sql
- id: uuid (Primary Key)
- session_id: varchar (セッション識別子)
- original_name: varchar (元ファイル名)
- processed_name: varchar (処理後ファイル名) ※拡張子変更可能
- processed_r2_key: text (R2キー)
- status: varchar ('processing' | 'completed' | 'error')
- error_message: text (エラー時のみ)
- created_at, updated_at: timestamp
```

## 主要モジュールの責務

### Server Actions (app/actions/)

**process.ts:**

- `processImages(formData)`: FormData から画像を取得し、Sharp 処理後 R2 にアップロード
  - ファイル検証 (MIME type, バッファ有効性)
  - 出力フォーマット選択 (`original`の場合、元画像フォーマット維持)
  - セッションキャッシュへメタデータ追加
- `flushImagesToDB(sessionId)`: キャッシュから Supabase へ一括保存

**download.ts:**

- `getMultipleSignedUrls(sessionId)`: Supabase から画像メタデータ取得し、R2 の署名付き URL 生成 (1 時間有効)

### 画像処理ユーティリティ (lib/utils/imageProcessor.ts)

- `getImageMetadata(buffer)`: Sharp 経由でメタデータ取得
- `validateImageBuffer(buffer)`: 画像バッファの有効性検証
- `resizeImage(buffer, options)`: リサイズ + フォーマット変換
- `cropImage(buffer, options)`: クロップ (`center`または`custom`戦略)
- `processImage(buffer, options)`: クロップ → リサイズの統合処理

### 設定 (lib/constants/config.ts)

```typescript
CONFIG = {
  CHUNK_SIZE: 1,
  MAX_FILES: 100,
  MAX_FILE_SIZE: 4MB,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', ...],
  IMAGE_PROCESSING: {
    DEFAULT_WIDTH: 640,
    DEFAULT_HEIGHT: 800,
    QUALITY: 85,
    FORMAT: 'jpeg',
    CROP_STRATEGY: 'center',
    RESIZE_FIT: 'cover',
  }
}
```

## 重要な制約と仕様

### Next.js サーバーアクション制約

- **next.config.ts**で`serverActions.bodySizeLimit: "4mb"`設定済み
- FormData で 1 枚ずつ送信して処理 (大量画像の同時処理を回避)

### 出力フォーマット処理

**拡張子変更機能:**

- `outputFormat`が`"original"`の場合、元画像のフォーマット維持
- それ以外 (`jpeg`, `png`, `webp`) の場合、指定フォーマットに変換
- ファイル名の拡張子も自動変更: `processedFileName = file.name.replace(/\.[^/.]+$/, .${actualFormat})`

### エラーハンドリング

**processImages()のエラー時:**

- 処理失敗した画像も`status: 'error'`としてセッションキャッシュに記録
- フロントエンドでエラー内容を表示可能

## コーディング規約

- **Biome**を使用 (`npm run check`で自動フォーマット)
- **コメントは英語、サービスとして表示される箇所は英語対応にスムーズに移行できるよう lib/constants/text.ts に日本語で記述したものを使用**
- **型安全性:** 全て TypeScript で厳密な型定義を使用
- **Server Actions:** `"use server"`ディレクティブ必須
- **環境変数:** 起動時チェックで throw Error (lib/storage/r2.ts, lib/db/supabase.ts 参照)

## 開発時の注意点

### ローカル開発の Supabase 設定

**マイグレーション適用:**

```bash
# Supabase CLIを使用している場合
supabase db push

# または手動でSQL実行
# supabase/migrations/*.sql を順番に実行
```

### R2 バケット設定

- `APP_ENV`環境変数で自動的に`dev`/`prod`パスを切り替え
- ローカル開発時は`APP_ENV=development`を推奨

### パフォーマンス考慮事項

- **Sharp 処理:** サーバーメモリ消費に注意 (Vercel の 1024MB 制限)
- **R2 アップロード:** `Promise.all()`で並列処理済み
- **セッションキャッシュ:** 長時間保持を避け、`flushImagesToDB()`で定期的にクリア

## 今後の拡張予定

プロジェクトルートの詳細設計書を参照:

- **人物検知機能 (TensorFlow.js):** `lib/utils/personDetector.ts`実装予定
- **person 戦略:** 人物を中心に配置したクロップ
- **自動フォールバック:** 人物検知失敗時は`center`戦略へ
