# マンション訪問記録システム

このプロジェクトは、マンションごとの訪問履歴を記録・確認できる簡易的なWebアプリです。Google MapsとGoogle Apps Script（GAS）、およびGoogleスプレッドシートを利用しています。

## 機能概要

- Google Maps 上にマンションのピンを表示
- ピンをタップすると該当マンションの部屋一覧を表示
- 部屋ごとに「在宅」「留守宅」「未訪問」などの状態を記録
- 記録は Google スプレッドシートに自動保存
- 部屋状態は色分けで視覚的に表示

## 使用技術

- フロントエンド：HTML / JavaScript / Bootstrap 5
- 地図表示：Google Maps JavaScript API
- データ保存：Google Apps Script + Google スプレッドシート
- デプロイ先：GitHub Pages

## 関連サービス・設定情報

### 🔑 Google Maps JavaScript API
- [Google Cloud Console](https://console.cloud.google.com/)
- 必要API：Maps JavaScript API
- 使用方法：APIキーを取得し、`index.html` 内の `<script src="https://maps.googleapis.com/maps/api/js?key=...">` に設定

### 📊 Google スプレッドシート構成（例）
#### Sheet: "Mansions"
| id | name         | latitude   | longitude  |
|----|--------------|------------|------------|
| 1  | ○○マンション | 35.xxxxxx  | 139.xxxxxx |

#### Sheet: "Rooms"
| mansion_id | room_number | last_visited | status | reachable | floor |
|------------|-------------|--------------|--------|-----------|-------|
| 1          | 101         | 2025-04-07   | 在宅   | ○         | 1     |

### 🧠 Google Apps Script (GAS)
- スクリプトをスプレッドシートに紐付けて作成
- Webアプリとしてデプロイ（匿名アクセス許可）
- `doGet()` でマンション／部屋一覧の取得
- `doGet(type=update_status)` で状態更新

### 🌍 GitHub Pages
- `index.html` をルートに配置
- GitHub リポジトリの [Settings] → [Pages] から公開設定

---

## セットアップ手順

1. Googleスプレッドシートを作成し、必要なシート（Mansions, Rooms）を用意
2. GAS を作成し、スプレッドシートと連携
3. GAS のWebアプリURLを取得して `script.js` 内のエンドポイントに設定
4. Google Cloud Platformで Maps JavaScript API を有効化し、APIキーを取得
5. `index.html` に APIキーを設定
6. GitHub リポジトリにコードをアップロードし、GitHub Pages で公開

---

## ディレクトリ構成（例）
```
/
├── index.html
├── css/
│   └── app.css
├── js/
│   └── script.js
└── README.md
```

---

## メンテナンス・引き継ぎポイント

- スプレッドシートの構造が変わった場合、GASスクリプト側のカラム対応も修正が必要
- GASのWebアプリを新しいアカウントで公開した場合、URLを差し替える必要あり
- Google Maps APIキーは有効期限や制限設定に注意（リファラ制限推奨）

---

## ライセンス
MIT License

