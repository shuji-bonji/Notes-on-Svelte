

# SvelteKit の PageOptions 属性比較

SvelteKit では、`+page.ts` や `+layout.ts` ファイルにおいて、いくつかのオプションをエクスポートすることで、ページ単位の動作制御が可能です。以下に代表的な PageOptions を表形式で整理し、使い分けの指針を記載します。

## ✅ PageOptions 比較表

| オプション              | 型         | 目的・効果                                                                 | デフォルト | 使用例                                   |
|-------------------------|------------|----------------------------------------------------------------------------|------------|------------------------------------------|
| `ssr`                   | `boolean`  | サーバーサイドレンダリングを有効／無効にする                             | `true`     | `export const ssr = false;`             |
| `csr`                   | `boolean`  | クライアントサイドレンダリングを有効／無効にする                         | `true`     | `export const csr = false;`             |
| `prerender`             | `boolean` or `'auto'` | 静的HTMLとしてビルド時に生成（SSG）                              | `'auto'`   | `export const prerender = true;`       |
| `trailingSlash`         | `'always' | 'never' | 'ignore'` | URLの末尾スラッシュの扱い                           | ルート設定依存 | `export const trailingSlash = 'never';` |
| `entries`               | `string[]` | 静的プリレンダ対象のパスを制限（`prerender`が有効な場合）                | `[]`       | `export const entries = ['/about'];`    |

## 🔁 用途別 PageOptions の使い分け

| シナリオ                                         | 適用オプション例                            |
|--------------------------------------------------|---------------------------------------------|
| クライアント専用ページ（ログイン状態に依存など） | `export const ssr = false;`                |
| 静的HTMLとしてビルドし、CDNから配信したい        | `export const prerender = true;`           |
| 非JavaScript環境では読み込ませたくない           | `export const csr = false;`                |
| `/about` と `/about/` をどちらかに統一したい     | `export const trailingSlash = 'never';`    |
| 静的出力対象ページを `/about` のみに制限したい   | `export const entries = ['/about'];`       |

## 📌 補足

- `ssr = false` は SSR を完全に無効化（クライアント専用）するため、API 認証前提のページなどに最適です。
- `csr = false` は JavaScript を無効にしても表示したいページ（静的な告知ページ等）に向いています。
- `prerender = true` は静的サイト生成(SSG)用途で、Vercel や Netlify 向きです。