# マンション訪問記録システム

マンションの各部屋に対する訪問履歴を記録・確認できるシンプルなWebアプリです。
Google Maps、Google Apps Script（GAS）、Google スプレッドシートを活用しています。

## 主な機能

- Google Maps 上にマンションをピンで表示
- ピンをクリックすると、該当マンションの部屋一覧を表示
- 部屋ごとに以下の訪問ステータスを記録可能
  - 在宅
  - 留宅
  - 拒否
  - 未訪問（デフォルト）
- ステータスに応じた色付きのボタン表示
- 記録はGoogleスプレッドシートに自動保存
- 過去の訪問履歴（最大10件）をタイムライン形式で表示
- 記録の取消（削除）機能付き

## 使用技術

- **フロントエンド**：HTML / JavaScript / [Bootstrap 4.6](https://getbootstrap.com/)
- **地図表示**：Google Maps JavaScript API
- **データ保存**：Google Apps Script + Google スプレッドシート
- **公開**：GitHub Pages

## デモUIの構成

- `index.html`：トップページ
- `js/app.js`：アプリのロジック
- `css/bootstrap.css`：Bootstrap本体
- `css/app.css`：独自スタイル

## Google Cloud & GAS 設定

### 🔑 Google Maps JavaScript API
- 必要API：`Maps JavaScript API`
- 設定手順:
  1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
  2. APIを有効化し、APIキーを取得
  3. `index.html` の `<script>` タグに APIキーを設定

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap&v=beta&libraries=marker" async defer></script>
```

### 📊 Google スプレッドシート構成（例）

**Mansions**

| id | name         | latitude   | longitude   |
|----|--------------|------------|-------------|
| 1  | ○○マンション | 35.xxxxxx  | 139.xxxxxx  |

**Rooms**

| id | mansion_id | room_number | last_visited | last_status | floor |
|----|------------|-------------|--------------|-------------|-------|
| 1  | 1          | 101         | 2025-04-07   | 在宅        | 1     |

**Records**

| id | room_id | status | user_id | created_at          | deleted_at |
|----|---------|--------|---------|----------------------|------------|
| 1  | 1       | 在宅   | 管理者  | 2025-04-07T12:00:00  |            |

## 🧐 Google Apps Script (GAS)

- スプレッドシートに組み込みGASを作成
- Webアプリとして公開（匿名アクセス許可）

主なエンドポイント：

| type             | 説明                      |
|------------------|---------------------------|
| `mansions`       | マンション一覧取得        |
| `rooms`          | 部屋＋履歴一覧取得        |
| `update_status`  | ステータス記録＆保存      |
| `delete_record`  | 記録の削除処理            |

## 🌍 GitHub Pages によるデプロイ

1. GitHubリポジトリを作成
2. `index.html` をルートに配置
3. [Settings] → [Pages] にて公開設定を行う

## セットアップ手順

1. Google スプレッドシートを作成し、必要な3シート（Mansions, Rooms, Records）を準備
2. GAS スクリプトを作成・デプロイして、WebアプリURLを取得
3. `app.js` の `GAS_ENDPOINT` に WebアプリURL を設定
4. Google Cloud Console で Maps JavaScript API を有効化し、APIキーを取得
5. `index.html` に APIキーを埋め込み
6. GitHub にコードをアップロードし、GitHub Pages で公開

## ディレクトリ構成（例）

```
/
├── index.html
├── css/
│   ├── bootstrap.css
│   └── app.css
├── js/
│   └── app.js
└── README.md
```

## メンテナンスポイント

- スプレッドシートの構成を変更した場合、GASスクリプトも修正が必要
- GAS WebアプリのURLはユーザー単位で変わるため、公開者を変替える際は注意
- Google Maps APIキーはリファラ制限推奨（漏泄防止のため）

## ライセンス

MIT License

