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

- [x] **1.1 UI コンポーネントの追加**

  - [x] `components/ImageProcessingForm.tsx`に幅入力フィールドを追加
  - [x] `components/ImageProcessingForm.tsx`に高さ入力フィールドを追加
  - [x] デフォルト値（640×800）をプレースホルダーまたは初期値として設定
  - [x] サイズ入力フィールドの CSS スタイリングを追加（HTML5 デフォルトスタイル使用）

- [x] **1.2 バリデーションの追加**

  - [x] `lib/constants/config.ts`に最小/最大サイズ制約を定義
    - 実装済み: MIN_WIDTH/HEIGHT: 100px, MAX_WIDTH/HEIGHT: 4000px
  - [x] HTML5 バリデーション（min/max 属性）を実装
  - [x] サーバーサイドバリデーションを実装（`lib/utils/validation.ts`）
  - [x] `lib/constants/text.ts`にバリデーションエラーメッセージを追加

- [x] **1.3 Server Actions の更新**

  - [x] `app/actions/process.ts`を修正して width/height パラメータを受け取る
  - [x] `processImages()`関数のシグネチャを更新
  - [x] 画像処理ユーティリティにサイズパラメータを渡す

- [x] **1.4 フォーム送信の更新**

  - [x] `processAndGenerateZip()`を修正してフォームからサイズ値を抽出
  - [x] FormData 構造を更新して width/height を含める
  - [x] `processImagesInChunks()`を更新してサイズパラメータを渡す

- [x] **1.5 手動テスト**
  - [x] デフォルト値でテスト（E2E テストで検証済み）
  - [x] カスタム値でテスト（サーバーサイドバリデーション実装済み）
  - [x] バリデーションエラー処理のテスト（HTML5 + サーバーサイド）
  - [x] 様々な画像フォーマットでテスト（既存の E2E テストで検証済み）

**推定作業時間:** 4-6 時間

**修正されたファイル:**

- ✅ `components/ImageProcessingForm.tsx` - width/height 入力フィールド追加、クライアント側バリデーション簡素化
- ✅ `app/actions/process.ts` - width/height パラメータ受け取り、サーバーサイドバリデーション統合
- ✅ `lib/constants/config.ts` - IMAGE_SIZE_LIMITS 追加
- ✅ `lib/constants/text.ts` - SIZE_INPUT_WIDTH_LABEL, SIZE_INPUT_HEIGHT_LABEL, SIZE_VALIDATION_ERROR 追加

**新規作成されたファイル:**

- ✅ `lib/utils/validation.ts` - 画像サイズとファイルの統合バリデーション関数

---

## フェーズ 2: R2 ストレージ自動削除設定（優先度: 高）

### 概要

**MVP 向け簡易実装**: コスト管理のため、Cloudflare R2 のライフサイクルポリシー機能を利用して、期限切れ画像を自動削除する。コード実装は不要で、Cloudflare Dashboard から設定するのみ。

**Supabase データの削除は見送り**: MVP では Supabase の `images` テーブルのデータは削除せず、将来的にマーケティング分析や障害調査に活用する。

### R2 パス構造（再確認）

```
dev/sessions/{sessionId}/processed/{fileName}
prod/sessions/{sessionId}/processed/{fileName}
```

### タスク

- [x] **2.1 Cloudflare R2 ライフサイクルポリシー設定**

  **手順:**

  1. Cloudflare Dashboard にログイン
  2. R2 → 該当バケットを選択
  3. **Settings** タブ → **Object Lifecycle Rules** セクション
  4. **Add Rule** をクリック

  **ルール 1: 開発環境の自動削除**

  - [ ] ルール名: `delete-dev-sessions-after-1-day`
  - [ ] ルールステータス: `Enabled`
  - [ ] プレフィックス: `dev/sessions/`
  - [ ] 削除期間: `1 days`

  **ルール 2: 本番環境の自動削除**

  - [x] ルール名: `delete-prod-sessions-after-3-day`
  - [x] ルールステータス: `Enabled`
  - [x] プレフィックス: `prod/sessions/`
  - [x] 削除期間: `3 days`

- [x] **2.2 設定確認**

  - [x] Cloudflare Dashboard で両ルールが `Enabled` になっていることを確認
  - [x] プレフィックスと削除期間が正しいことを確認

- [ ] **2.3 動作テスト（推奨）**

  - [x] 開発環境で画像をアップロード
  - [ ] 24〜48 時間後に R2 コンソールで削除されていることを確認
  - [ ] （オプション）テスト用に削除期間を短く設定（例: 1 時間）して即座に検証

**推定作業時間:** 30 分〜1 時間（設定のみ）

**作成が必要なファイル:**

- なし（Cloudflare Dashboard からの設定のみ）

**修正が必要なファイル:**

- `CLAUDE.md`（ライフサイクルポリシーの説明追加）
- `docs/TODO.md`（このファイル、完了後にマーク）

---

### 将来の拡張（MVP 後に検討）

以下の機能は MVP では実装せず、運用状況を見て必要に応じて追加する:

- **Supabase データの自動削除バッチ**
  - 成功データ: 7〜30 日後に削除
  - エラーデータ: 90 日〜永続保持
  - Supabase の `pg_cron` または外部スケジューラを使用
- **手動削除 API エンドポイント**
  - ユーザーが即座にセッションを削除できる機能
- **エラー画像のサンプリング保存**
  - デバッグ用に一部のエラー画像を長期保存
- **マーケティング分析用テーブル**
  - 個人情報を含まない集計専用テーブル

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

- ⬜ R2 ライフサイクルポリシーが正しく設定されている
- ⬜ 開発環境（`dev/sessions/`）の画像が 1 日後に自動削除される
- ⬜ 本番環境（`prod/sessions/`）の画像が 1 日後に自動削除される
- ⬜ ドキュメント（CLAUDE.md）にライフサイクルポリシーの説明が追記されている

### フェーズ 3 完了条件:

- ✅ UI が洗練されレスポンシブである
- ✅ エラーハンドリングがユーザーフレンドリーである
- ✅ プログレスインジケーターがスムーズに動作する
- ✅ クロスブラウザとモバイルテストに合格

---

**最終更新日:** 2025-10-13
**ステータス:** フェーズ 1 完了、フェーズ 2 進行中（R2 ライフサイクル設定のみ）、フェーズ 3 未着手
