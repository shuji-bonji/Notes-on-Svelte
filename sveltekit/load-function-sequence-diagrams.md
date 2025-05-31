# `+page.ts` と `+page.server.ts` の実行タイミングと責任範囲図解

SvelteKitにおける `+page.ts` と `+page.server.ts` の `load()` 関数は、クライアント側とサーバ側で異なるタイミングと責任範囲で実行されます。以下にユースケース別の **Mermaidシーケンス図** を用いて、それらの違いを明示します。


## ✅ 初回アクセス時の処理フロー（SSR）

```mermaid
sequenceDiagram
    participant Browser
    participant SvelteKitServer
    participant PageServerLoad as +page.server.ts load()
    participant HTMLRenderer

    Browser->>SvelteKitServer: HTTP GET /page
    SvelteKitServer->>PageServerLoad: execute load()
    PageServerLoad-->>SvelteKitServer: { props }
    SvelteKitServer->>HTMLRenderer: render SSR HTML + embedded data
    HTMLRenderer-->>Browser: SSR HTML response
```

- `+page.server.ts` の `load()` が実行され、取得されたデータは HTML に埋め込まれる。
- `+page.ts` の `load()` は **この時点では実行されない**。


## 🔁 クライアント遷移（SPA）の場合の処理フロー

```mermaid
sequenceDiagram
    participant Browser
    participant ClientRouter
    participant PageLoad as +page.ts load()

    Browser->>ClientRouter: Click internal link
    ClientRouter->>PageLoad: execute load()
    PageLoad-->>ClientRouter: return data
```

- ブラウザ内でのナビゲーション時は `+page.ts` の `load()` のみが実行される。
- HTTP通信は `fetch()` を使った場合にのみ発生。


## ☁️ プリサインドURLを用いた公開APIフェッチの例

```mermaid
sequenceDiagram
    participant Browser
    participant CloudStorage as S3/Cloud API

    Browser->>CloudStorage: GET /presigned-url?token=abc123
    CloudStorage-->>Browser: File (or 403 Forbidden)
```

- 実装場所: `+page.ts`、または `form action` 内 `fetch()`
- セキュアな一時的アクセスに使用される公開API例。


## 🗃 バックエンドDBアクセス（DBサーバ分離構成）

```mermaid
sequenceDiagram
    participant Browser
    participant SvelteKitServer
    participant PageServerLoad as +page.server.ts load()
    participant DBServer as External DB

    Browser->>SvelteKitServer: HTTP GET /page
    SvelteKitServer->>PageServerLoad: execute load()
    PageServerLoad->>DBServer: SELECT * FROM table
    DBServer-->>PageServerLoad: result
    PageServerLoad-->>SvelteKitServer: props
    SvelteKitServer-->>Browser: SSR HTML
```

- DB が外部サーバにある場合でも、`+page.server.ts` の中で責任を持って接続・取得。
- クライアントからは DB に直接触れることはない。


## 🔐 認証付きページアクセス（hooks + layout）

```mermaid
sequenceDiagram
    participant Browser
    participant SvelteKitServer
    participant Hooks as hooks.server.ts
    participant LayoutServerLoad as +layout.server.ts load()
    participant SessionDB

    Browser->>SvelteKitServer: HTTP GET /protected
    SvelteKitServer->>Hooks: handle + attach locals
    Hooks->>SessionDB: validate session cookie
    SessionDB-->>Hooks: user info
    Hooks-->>SvelteKitServer: locals.user
    SvelteKitServer->>LayoutServerLoad: execute load()
    LayoutServerLoad-->>SvelteKitServer: props
    SvelteKitServer-->>Browser: SSR HTML
```


このように、実行されるファイル・タイミング・通信先を図式化することで、`+page.ts` と `+page.server.ts` の役割と適切な使い分けがより明確になります。