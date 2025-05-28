# SPAとSSRの潮流と構成の選択肢

現代のフロントエンド開発では、従来の SPA（Single Page Application）と Web API による構成に加え、SSR（Server Side Rendering）や Hydration によるマルチレンダリング構成が注目されています。

## 背景：SPAの限界とSSRの再評価

|観点|SPA (Angular, Reactなど)|SSR / SSG / Islands (SvelteKit, Next.jsなど)|
|---|---|---|
|初期表示速度|遅い（JSバンドル後に描画）|速い（HTMLで描画開始）|
|SEO|弱い（対策必要）|強い（HTMLでクローラ対応）|
|複雑な状態管理|必要（グローバルステートなど）|必要最小限にできる|
|API通信|常に必要|SSRで先に取得できる|
|JS依存|高い|Hydrationで最低限化可能|


## Webの進化と新しい潮流
1. Jamstackの流行 → SSR/SSGブーム
2. Next.js、Nuxt.js、SvelteKit の登場
3. 部分的ハイドレーション（Islands Architecture）
4. Edge Functions / Server Components（Next.js App Router）

## 開発者視点での実際の選択肢

|構成|特徴|代表例|
|---|---|---|
|SPA + API分離|旧来型だが構造は明確|Angular + WebAPI|
|SSR with hydration|表示が早く SEOも強い|SvelteKit, Next.js|
|SSG (静的生成)|ビルド時にHTML生成|Astro, Hugo, Next.js|
|Islands Architecture|部分だけJS起動|SvelteKit（可能）、Astro|


## SvelteKit の立ち位置

SvelteKit は SPA 的構成も可能でありながら、SSR/SSG も対応。
さらに +page.ts, +page.server.ts, +layout.ts などのファイル構成により、以下のようなハイブリッドな開発がしやすくなっています。
- SSRでデータ取得（+page.server.ts）
- クライアントでイベントバインド（+page.svelte による Hydration）

## 今後の動向予測（用途別）

|分野|傾向|
|---|---|
|企業向け業務アプリ|今もSPAが主力（Angular, React）|
|一般向けWebサイト|SSRやSSGが主流（Next.js, SvelteKit）|
|PWA, ネイティブライクUI|SPAまたは部分Hydration（Svelteが適任）|
|SEO重視・高速化要求|SSR or Islands構成が有利|


## 結論

SPAとSSRは対立ではなく共存・選択肢の関係です。
今後は「ページ単位で適切な構成を選ぶ力」が重要になります。

