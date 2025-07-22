# SvelteKit データロードの基本的な流れ（例: ページ初期表示時）

SvelteKit の `+layout.ts` / `+layout.server.ts` / `+page.ts` / `+page.server.ts` と API (`+server.ts`) のデータフローをシーケンス図（Mermaid 形式）で表現してみましょう。


```mermaid
sequenceDiagram
    participant Browser
    participant Server
    participant LayoutServerLoad as +layout.server.ts
    participant PageServerLoad as +page.server.ts
    participant LayoutLoad as +layout.ts
    participant PageLoad as +page.ts
    participant API as +server.ts

    Browser->>Server: HTTP request (e.g. /page)
    Server->>LayoutServerLoad: 呼び出し (server-side load)
    LayoutServerLoad-->>Server: layout data (server-side)
    Server->>PageServerLoad: 呼び出し (server-side load)
    PageServerLoad-->>Server: page data (server-side)
    Server-->>Browser: 初期HTML + 初期データ (props)

    Note over Browser: ページ初期描画後<br>クライアントハイドレーション

    Browser->>LayoutLoad: 呼び出し (client-side load)
    LayoutLoad-->>Browser: layout data (client-side)

    Browser->>PageLoad: 呼び出し (client-side load)
    PageLoad-->>Browser: page data (client-side)

    Note over Browser: UI更新

    Browser->>API: API fetch (+server.ts)
    API-->>Browser: API response (JSON など)
```

### 説明：

✅ **重要なポイント**

* 初回リクエストは **サーバー側** の `+layout.server.ts` → `+page.server.ts` が順に呼ばれる。
* HTML と一緒に **初期データが `props` としてブラウザへ送られる**。
* その後、クライアント側で `+layout.ts` と `+page.ts` が呼ばれ、必要なら再フェッチ。
* `+server.ts` は **APIリクエスト専用のエンドポイント** で `fetch` 経由でアクセス。

