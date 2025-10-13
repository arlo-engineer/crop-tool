# TODO リスト - 画像トリミングツール

## 実装ロードマップ

このドキュメントは、画像トリミング・リサイズサービスの残りの実装タスクを示しています。

---

## フェーズ 0: 最小限の E2E テスト実装（優先度: 中〜高）

### 概要

**最小限・最重要のテストのみ実装**: 主要なユーザーフロー（画像選択 → 処理 →ZIP ダウンロード → 画像確認）をカバーする 1 つの E2E テストを作成。これにより、リグレッションを防ぎつつ、テストメンテナンスコストを最小化する。

### テスト方針

- **テストケースは 1 つ**: ハッピーパスのみ（正常系）
- **カバー範囲**: 画像アップロード → 処理 → ZIP ダウンロード → 画像検証
- **テストしない**: エラーケース、エッジケース（手動テストで対応）

### タスク

- [x] **0.1 Playwright セットアップ（最小構成）**

  - [x] Playwright をインストール（Docker 経由）
    ```bash
    docker compose --profile dev exec dev npm install -D @playwright/test
    docker compose --profile dev exec dev npx playwright install chromium
    ```
  - [x] `playwright.config.ts` を作成（最小設定）
  - [x] `tests/e2e/` ディレクトリを作成
  - [x] package.json にテストスクリプトを追加
    ```json
    "test:e2e": "playwright test"
    ```
  - [x] Makefile にテスト実行コマンドを追加（推奨）
    ```makefile
    test:
    	docker compose --profile dev exec dev npm run test:e2e
    ```

- [x] **0.2 テスト用画像の準備**

  - [x] `tests/fixtures/` ディレクトリを作成
  - [x] テスト用サンプル画像を 2-3 枚配置（JPEG/PNG）
  - [x] `.gitignore` にテスト生成物を追加

- [x] **0.3 メインフローの E2E テスト実装**

  - [x] `tests/e2e/main-flow.spec.ts` を作成
  - [x] テストシナリオ:
    1. トップページにアクセス
    2. ファイル入力に画像を選択（2-3 枚、**人物が写っている画像を含む**）
    3. 「処理開始」ボタンをクリック
    4. 処理完了を待機（「Download ZIP」ボタンが表示されるまで）
    5. ZIP ファイルをダウンロード
    6. ZIP を解凍して画像ファイルが存在することを確認
    7. 画像のサイズが 640×800 であることを確認（Sharp 使用）
    8. **人物が画像の中央付近に配置されていることを確認（人物検知テスト）**

- [x] **0.4 ZIP ファイル検証ヘルパーの作成**
  - [x] `tests/helpers/zipValidator.ts` を作成
  - [x] ZIP 解凍機能
  - [x] 画像サイズ検証機能（Sharp 使用）
  - [x] 画像枚数検証機能
  - [x] **人物中央配置検証機能（TensorFlow.js または類似ライブラリ使用）**
    - 処理済み画像から人物検知を実行
    - 検出された人物のバウンディングボックス中心座標を取得
    - 画像中心との距離が許容範囲内（例: 画像幅の 20%以内）であることを確認

**推定作業時間:** 2-3 時間（最小構成）

**作成が必要なファイル:**

- `playwright.config.ts`（シンプルな設定）
- `tests/e2e/main-flow.spec.ts`（メインテスト 1 ファイルのみ）
- `tests/helpers/zipValidator.ts`（ZIP 検証ヘルパー）
- `tests/fixtures/` （テスト用画像 2-3 枚）

**修正が必要なファイル:**

- `package.json` (テストスクリプト追加)
- `.gitignore` (テスト生成物除外)

**注意:** フェーズ 1 以降のテストは手動で実施。E2E テストコードの追加実装は不要。

---

## フェーズ 1: カスタム画像サイズ入力機能（優先度: 高）

### 概要

デフォルトの 640×800px のみではなく、ユーザーが任意の幅と高さを指定して画像処理できるようにする。

### タスク

- [ ] **1.1 UI コンポーネントの追加**

  - [ ] `components/ImageProcessingForm.tsx`に幅入力フィールドを追加
  - [ ] `components/ImageProcessingForm.tsx`に高さ入力フィールドを追加
  - [ ] デフォルト値（640×800）をプレースホルダーまたは初期値として設定
  - [ ] サイズ入力フィールドの CSS スタイリングを追加

- [ ] **1.2 バリデーションの追加**

  - [ ] `lib/constants/config.ts`に最小/最大サイズ制約を定義
    - 推奨: MIN_WIDTH/HEIGHT: 100px, MAX_WIDTH/HEIGHT: 4000px
  - [ ] フォームコンポーネントでクライアントサイドバリデーションを実装
  - [ ] `lib/constants/text.ts`にバリデーションエラーメッセージを追加
  - [ ] ユーザーにバリデーションエラーを表示

- [ ] **1.3 Server Actions の更新**

  - [ ] `app/actions/process.ts`を修正して width/height パラメータを受け取る
  - [ ] `processImages()`関数のシグネチャを更新
  - [ ] 画像処理ユーティリティにサイズパラメータを渡す

- [ ] **1.4 フォーム送信の更新**

  - [ ] `processAndGenerateZip()`を修正してフォームからサイズ値を抽出
  - [ ] FormData 構造を更新して width/height を含める
  - [ ] `processImagesInChunks()`を更新してサイズパラメータを渡す

- [ ] **1.5 手動テスト**
  - [ ] デフォルト値でテスト
  - [ ] カスタム値でテスト（エッジケース: 非常に小さい、非常に大きい）
  - [ ] バリデーションエラー処理のテスト
  - [ ] 様々な画像フォーマットでテスト

**推定作業時間:** 4-6 時間

**修正が必要なファイル:**

- `components/ImageProcessingForm.tsx`
- `app/actions/process.ts`
- `lib/constants/config.ts`
- `lib/constants/text.ts`
- `app/globals.css`（オプション、スタイリング）

---

## フェーズ 2: R2 ストレージクリーンアップ実装（優先度: 中）

### 概要

コスト管理と期限切れセッションデータの削除のため、R2 ストレージの削除機能を実装する。

### タスク

- [ ] **2.1 R2 削除関数の追加**

  - [ ] `lib/storage/r2.ts`に`deleteFromR2(key: string)`を追加
    - AWS SDK の`DeleteObjectCommand`を使用
  - [ ] `lib/storage/r2.ts`に`listSessionObjects(sessionId: string)`を追加
    - プレフィックスフィルタ付きの`ListObjectsV2Command`を使用
  - [ ] `lib/storage/r2.ts`に`deleteSessionFromR2(sessionId: string)`を追加
    - セッションディレクトリ内のすべてのオブジェクトをリスト
    - バッチでオブジェクトを削除（`DeleteObjectsCommand`を使用）

- [ ] **2.2 クリーンアップ Server Actions の作成**

  - [ ] 新規ファイル`app/actions/cleanup.ts`を作成
  - [ ] `deleteSession(sessionId: string)`を実装
    - R2 ストレージから削除
    - Supabase images テーブルから削除
    - 成功/エラー結果を返す
  - [ ] `cleanupExpiredSessions()`を実装
    - Supabase から期限切れセッションをクエリ
    - 各期限切れセッションを削除
    - クリーンアップ結果をログ出力

- [ ] **2.3 データベースマイグレーション**

  - [ ] `supabase/migrations/`にマイグレーションファイルを作成
  - [ ] `images`テーブルに`expires_at`カラム（timestamp）を追加
  - [ ] デフォルト有効期限を設定（例: created_at から 24 時間後）
  - [ ] 効率的なクエリのため`expires_at`にインデックスを追加

- [ ] **2.4 セッションキャッシュの更新**

  - [ ] `lib/cache/sessionCache.ts`を更新して有効期限を設定
  - [ ] キャッシュクリーンアップロジックを追加（メモリから古いセッションを削除）

- [ ] **2.5 オプション: クリーンアップ API エンドポイント**

  - [ ] API ルート`app/api/cleanup/route.ts`を作成
  - [ ] 手動セッション削除エンドポイントを実装
  - [ ] 認証/認可を追加（必要に応じて）

- [ ] **2.6 オプション: スケジュールされたクリーンアップ**

  - [ ] cron ジョブまたはスケジュールタスクを設定
  - [ ] `cleanupExpiredSessions()`を定期的に呼び出し（例: 1 時間ごと）
  - [ ] Vercel Cron Jobs または外部スケジューラの使用を検討

- [ ] **2.7 手動テスト**
  - [ ] 単一ファイル削除のテスト
  - [ ] セッション削除（複数ファイル）のテスト
  - [ ] 期限切れセッションクリーンアップのテスト
  - [ ] Supabase レコードが削除されることを確認
  - [ ] エラーハンドリングのテスト（ファイルなし、ネットワークエラー）

**推定作業時間:** 6-8 時間

**作成が必要なファイル:**

- `app/actions/cleanup.ts`
- `supabase/migrations/YYYYMMDDHHMMSS_add_expires_at.sql`
- `app/api/cleanup/route.ts`（オプション）

**修正が必要なファイル:**

- `lib/storage/r2.ts`
- `lib/cache/sessionCache.ts`
- `lib/constants/config.ts`（EXPIRATION_HOURS を追加）

---

## フェーズ 3: UI/UX 改善（優先度: 低〜中）

### 概要

コア機能が完成した後、ユーザーインターフェースを洗練し、全体的なユーザー体験を向上させる。

### タスク

- [ ] **3.1 プログレスインジケーター**

  - [ ] `components/ProgressBar.tsx`コンポーネントを作成
  - [ ] 現在のファイル番号 / 総ファイル数を表示
  - [ ] 完了率パーセンテージを表示
  - [ ] 残り時間の推定を追加（オプション）

- [ ] **3.2 エラー表示の改善**

  - [ ] `components/ErrorMessage.tsx`コンポーネントを作成
  - [ ] `alert()`をカスタムエラー UI に置き換え
  - [ ] ファイルごとのエラー詳細を表示
  - [ ] 閉じる/非表示機能を追加

- [ ] **3.3 成功状態の改善**

  - [ ] `components/SuccessMessage.tsx`コンポーネントを作成
  - [ ] 成功時の`alert()`をカスタム UI に置き換え
  - [ ] 処理サマリーを表示（総ファイル数、成功/エラー件数）
  - [ ] ダウンロードボタンの視認性を向上

- [ ] **3.4 レスポンシブデザイン**

  - [ ] モバイルデバイスでテスト（iOS、Android）
  - [ ] タブレットでテスト
  - [ ] 小さい画面用にレイアウトを調整
  - [ ] レスポンシブブレークポイントで`app/globals.css`を更新

- [ ] **3.5 ローディング状態の改善**

  - [ ] スケルトンローダーを追加
  - [ ] ボタンの無効化状態を改善
  - [ ] アニメーションスピナーを追加
  - [ ] 処理状況メッセージを表示

- [ ] **3.6 オプション: 画像プレビュー**

  - [ ] 処理前に選択した画像のサムネイルを表示
  - [ ] 処理済み画像のプレビューを表示
  - [ ] 個別画像の削除機能を追加

- [ ] **3.7 オプション: ダウンロード履歴**

  - [ ] 最近のセッション一覧を表示（期限切れでない場合）
  - [ ] 過去のセッションの再ダウンロードを許可
  - [ ] フェーズ 2 の削除機能と連携
  - [ ] 履歴アイテムごとに「セッション削除」ボタンを追加

- [ ] **3.8 アクセシビリティ**

  - [ ] フォーム要素に ARIA ラベルを追加
  - [ ] キーボードナビゲーションが機能することを確認
  - [ ] スクリーンリーダーでテスト
  - [ ] フォーカスインジケーターを追加

- [ ] **3.9 パフォーマンス最適化**

  - [ ] 重いコンポーネントを遅延ロード
  - [ ] バンドルサイズを最適化
  - [ ] 非同期操作のローディング状態を追加
  - [ ] コード分割を検討

- [ ] **3.10 手動テスト**
  - [ ] クロスブラウザテスト（Chrome、Firefox、Safari、Edge）
  - [ ] モバイルテスト
  - [ ] アクセシビリティテスト
  - [ ] パフォーマンステスト（Lighthouse）

**推定作業時間:** 8-12 時間

**作成が必要なファイル:**

- `components/ProgressBar.tsx`
- `components/ErrorMessage.tsx`
- `components/SuccessMessage.tsx`
- `components/ImagePreview.tsx`（オプション）
- `components/DownloadHistory.tsx`（オプション）

**修正が必要なファイル:**

- `components/ImageProcessingForm.tsx`
- `app/globals.css`
- `app/layout.tsx`（グローバルスタイル用）

---

## メモ

### 必要な設定の更新

`lib/constants/config.ts`に追加:

```typescript
IMAGE_SIZE_LIMITS: {
  MIN_WIDTH: 100,
  MAX_WIDTH: 4000,
  MIN_HEIGHT: 100,
  MAX_HEIGHT: 4000,
},
SESSION_EXPIRATION_HOURS: 24,
```

### 必要なテキスト定数

`lib/constants/text.ts`に追加:

```typescript
SIZE_INPUT_WIDTH_LABEL: "幅 (px)",
SIZE_INPUT_HEIGHT_LABEL: "高さ (px)",
SIZE_VALIDATION_ERROR: "画像サイズは100〜4000pxの範囲で指定してください",
SESSION_DELETED_MESSAGE: "セッションを削除しました",
SESSION_DELETE_ERROR: "セッションの削除に失敗しました",
```

---

## 完了基準

### フェーズ 1 完了条件:

- ✅ ユーザーがカスタム幅/高さを入力できる
- ✅ バリデーションが正しく動作する
- ✅ カスタムサイズで画像が処理される
- ✅ デフォルト値が期待通りに動作する

### フェーズ 2 完了条件:

- ✅ R2 削除関数が正しく動作する
- ✅ セッションを削除できる（R2 + Supabase）
- ✅ 期限切れセッションが自動的にクリーンアップされる
- ✅ ストレージに孤立したデータが残らない

### フェーズ 3 完了条件:

- ✅ UI が洗練されレスポンシブである
- ✅ エラーハンドリングがユーザーフレンドリーである
- ✅ プログレスインジケーターがスムーズに動作する
- ✅ クロスブラウザとモバイルテストに合格

---

**最終更新日:** 2025-10-13
**ステータス:** 計画フェーズ
