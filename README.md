# kimariji_master

百人一首の決まり字を語呂合わせ付きで暗記でき、覚えているかのチェックをブラウザだけで練習できる PWA です。

## 公開ページ

- https://kg9n3n8y.github.io/kimariji_master/

## ブランチ

| ブランチ | 内容 |
|----------|------|
| `main` | v1（レガシー） |
| `v2` | v2 開発中（React + Vite + TypeScript） |

## v2 開発（`v2` ブランチ）

### セットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173/kimariji_master/ を開く。

### コマンド

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド（`dist/`） |
| `npm run preview` | ビルド成果物のプレビュー |
| `npm test` | ユニットテスト（Vitest） |

### ディレクトリ

```
src/           # React アプリ本体
public/        # 静的アセット（取り札・語呂画像など）
legacy/        # v1 ソース（参照用）
doc/           # 仕様ドキュメント
dist/          # ビルド出力（GitHub Pages デプロイ対象）
```

### デプロイ

`main` / `v2` への push で GitHub Actions が `dist/` を GitHub Pages にデプロイする（`.github/workflows/deploy.yml`）。

仕様の詳細は [doc/v2/README.md](./doc/v2/README.md) を参照。

---

## v1（レガシー）

v1 は `legacy/` に退避済み。静的ファイルのみで構成されていました。

```bash
cd legacy
python3 -m http.server 4173
# ルートから public アセットを参照する場合は v2 の npm run dev を推奨
```
