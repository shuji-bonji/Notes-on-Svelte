

# SvelteKit の `$env` モジュール比較と使い分け

SvelteKit では `$env/*` を通じて `.env` ファイルや `process.env` に定義された環境変数へアクセスできます。用途に応じて次の4種類のモジュールを使い分けます。


## ✅ `$env` モジュール4種の比較表

| モジュール名                     | 読み取り対象       | 参照タイミング        | クライアントアクセス | 用途の例                                         |
|----------------------------------|--------------------|------------------------|----------------------|--------------------------------------------------|
| `$env/static/private`            | `.env.*`（`PUBLIC_`なし）| **ビルド時に静的参照** | ❌（サーバー専用）    | APIキー・DB接続文字列・認証秘密鍵など           |
| `$env/static/public`             | `.env.*`（`PUBLIC_`付き）| **ビルド時に静的参照** | ✅（クライアントOK）  | 公開設定、UIモード、Google Maps APIキーなど     |
| `$env/dynamic/private`           | `.env.*`（`PUBLIC_`なし）| **実行時に動的参照**   | ❌（サーバー専用）    | セッションによって切り替わる認証情報など        |
| `$env/dynamic/public`            | `.env.*`（`PUBLIC_`付き）| **実行時に動的参照**   | ✅（クライアントOK）  | クライアント側から読み込む環境に応じた設定など  |


## 🔁 主な使い分けの指針

| 使用シーン                                             | 適切なモジュール              | 理由                                               |
|--------------------------------------------------------|-------------------------------|----------------------------------------------------|
| 認証トークン、DB接続文字列、Stripeの秘密鍵            | `$env/static/private`         | クライアントに漏れてはならず、値はビルド時固定     |
| Webアプリのテーマ設定、公開Google Mapsキー             | `$env/static/public`          | クライアント側でも使え、ビルド時に展開したい       |
| `process.env` 風にリクエストごとに動的な環境参照が必要 | `$env/dynamic/private`        | サーバー側で実行時に値が変化する可能性がある場合   |
| 実行環境（本番/開発）によってクライアントに異なる設定を渡す | `$env/dynamic/public`        | クライアントでも動的に環境によって切り替えたい設定 |


## 📘 各モジュールの使い方例

### `$env/static/private`

```ts
// server-only, static at build time
import { API_KEY } from '$env/static/private';

console.log(API_KEY); // 値はビルド時に埋め込まれる
```

### `$env/static/public`

```ts
// safe for client
import { PUBLIC_MAPS_KEY } from '$env/static/public';

console.log(PUBLIC_MAPS_KEY); // クライアントで使える
```

### `$env/dynamic/private`

```ts
// dynamic server-only
import { env } from '$env/dynamic/private';

console.log(env.API_KEY); // 実行時の環境に依存する
```

### `$env/dynamic/public`

```ts
// dynamic and exposed to client
import { env } from '$env/dynamic/public';

console.log(env.PUBLIC_FEATURE_FLAG); // クライアント実行時に切り替え可能
```


## 🔒 セキュリティ上の注意

- `PUBLIC_` がついていない環境変数は **絶対にクライアントに出さないこと**
- `dynamic/*` は `.env` 以外にも、実行環境の `process.env` を直接反映するため、**ランタイムで変更可能**

## 🧪 より具体的な活用シーンと補足

### `$env/static/private`

- Stripe の Secret Key を使って支払いを処理する
- Supabase/PostgreSQL などへの接続設定をサーバー上に保持する
- OAuth クライアントシークレットなど、**絶対に外部に漏らしてはならない値**

### `$env/static/public`

- Google Maps などの**公開 API キー**（利用制限付き）
- フロントエンドに渡すテーマカラー、言語モード、機能フラグ（例: `PUBLIC_FEATURE_X=true`）
- Vite などのビルドツールが展開する定数と同様の使い方

### `$env/dynamic/private`

- GitHub Actions などの CI/CD 環境で `.env` ファイルを使わず、Secrets で渡された値を使う
- Docker コンテナで `.env` を使わず、起動時の `-e` オプションで設定される環境変数を参照
- ステージング/本番を同一コードで切り替えたいが、**実行時にしか判別できない**場合

### `$env/dynamic/public`

- サブドメインやパスに応じてクライアント側で挙動を切り替えたい（例: `env.PUBLIC_APP_MODE`）
- 実行環境によって機能フラグをクライアントに動的に渡したい
- PWAやService Workerなど、**リロードなしに状態切替を行いたい場面**


### ✅ 結論

`$env/static/*` を基本とし、特殊な実行時環境や柔軟性が必要な場合のみ `$env/dynamic/*` を検討するのが実用的です。




## 🧭 まとめ

| 目的                   | static or dynamic | public or private | 適切なモジュール              |
|------------------------|-------------------|-------------------|-------------------------------|
| 機密情報               | static            | private           | `$env/static/private`         |
| クライアントに渡す設定 | static            | public            | `$env/static/public`          |
| サーバー実行時に変更   | dynamic           | private           | `$env/dynamic/private`        |
| クライアント実行時に動的設定 | dynamic      | public            | `$env/dynamic/public`         |

