# SvelteKit Adapter 選定フローチャート

あなたのSvelteKitアプリはどこで・どう動かすのが最適か？  


## 🔀 フローチャート

```mermaid
flowchart TD
    Q1(SSRやAPIを使いたい？) -->|Yes| Q2(どこにホスティングする？)
    Q1 -->|No（静的サイトでOK）| A1[✅ adapter-static]

    Q2 --> Q2A[自前Node.js環境がある？]
    Q2A -->|Yes| A2[✅ adapter-node]
    Q2A -->|No| Q2B[どのサービス？]

    Q2B -->|Vercel| A3[✅ adapter-vercel]
    Q2B -->|Netlify| A4[✅ adapter-netlify]
    Q2B -->|Cloudflare Pages| A5[✅ adapter-cloudflare]
    Q2B -->|その他のサーバレス| A6[✅ adapter-auto（推奨）]
```

## 🗂 選択肢まとめ

|Adapter|説明|用途例|
|---|---|---|
|adapter-static|静的HTML/JS/CSSで完結|ブログ、LP、ドキュメントサイト|
|adapter-node|Node.js サーバで稼働|VPS, EC2, Firebase Hosting with Functions|
|adapter-vercel|Vercel環境最適化|Vercel 公式推奨|
|adapter-netlify|Netlify専用機能対応|Netlify Forms, Redirectsなど|
|adapter-cloudflare|Cloudflare Pages + Workers 向け|Edge Functions環境|
|adapter-auto|多くの環境で自動選択|開発中の自動判別や汎用利用に便利|


## ✅ 例：よくある構成選び

|条件|選ぶAdapter|
|---|---|
|全ページを静的にしたい|adapter-static|
|Node.jsサーバがすでにある|adapter-node|
|無料・高速・簡単に使いたい|adapter-vercel or adapter-netlify|
|Edge Functionsで低レイテンシ|adapter-cloudflare|
|どれ使えばいいか迷ってる|adapter-auto（開発には最適）|


## 🔚 まとめ
- SvelteKit は 1つのコードで多様な配信方法を実現。
- アプリの性質・運用環境に応じて adapter-* を柔軟に選びましょう。
- 必要なら vite.config.js や hooks.server.ts で高度な制御も可能です。
