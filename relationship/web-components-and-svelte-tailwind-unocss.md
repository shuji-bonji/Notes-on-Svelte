# Web Components と Svelte/Tailwind/UnoCSS における整理と考察

このまとめは、Svelte で Web Components を設計・配布する際の基礎理解と、TailwindCSS や UnoCSS との関係、ならびに SSR/SSG との適合性を塾考・記録したものです。


## 🎯 **結論：Web Components の特性**

* **Web Components（Custom Elements + Shadow DOM）は "ポータブル UI 部品" として極めて有用**
* しかし本質的に:

  * 🧩 **自己完結性 / スタイルの isolation が強み**
  * ⚠️ **SSR/SSG 初期描画には適さない（クライアント側 JS が hydration して初めて有効になる）**

## 🔔 **主要キーワードと概要**

### ✅ [Svelte `customElement: true`](https://svelte.dev/docs/svelte-compile#customelement)

* Svelte でコンポーネントを Web Components としてビルドする公式オプション。
* Shadow DOM に HTML と CSS を閉じ込めるので、外部スタイルと完全分離可能。

### ✅ [Tailwind CSS `@apply`](https://tailwindcss.com/docs/functions-and-directives#apply)

* Tailwind のユーティリティクラスを CSS に展開するディレクティブ。
* `@apply` 自体はスコープ isolation を保証しない。

  * Scoped CSS 内で使えば "擬似 Scoped" にできる。

### ✅ [UnoCSS](https://unocss.dev/)

* Tailwind 互換のユーティリティファースト Atomic CSS。
* [UnoCSS Svelte Scoped](https://unocss.dev/integrations/svelte-scoped) により、`data-v-xxxx` セレクタによる擬似 Scoped を提供。
* ただし Shadow DOM に閉じ込めるわけではないので、Scoped CSS と同等のセレクタ戦略。

### ✅ [Scoped CSS と Shadow DOM の違い](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)

* Scoped CSS（Svelte 独自スコープ）: セレクタの名前空間管理によりスコープ "風" を提供。
* Shadow DOM: ネイティブ API により真に isolation された DOM + CSS カプセル。

### ✅ [SSR/SSG と Web Components の関係](https://news.ycombinator.com/item?id=33828039)

* SSR/SSG では HTML にタグを出力可能だが、Shadow DOM 内の内容は hydration 完了まで空。
* SEO や初期描画が重要な場合には不適。


## 🔨 **利用戦略まとめ**

| 目的                         | 推奨アプローチ                                            |
| -------------------------- | -------------------------------------------------- |
| 💡 UI 部品としてポータブルに再利用       | Web Components（`customElement: true` + Shadow DOM） |
| 🚀 SEO/初期描画重視              | SSR/SSG 可能な Svelte コンポーネント（通常の Scoped CSS）         |
| 🔧 擬似 Scoped + Utility CSS | UnoCSS Svelte Scoped / Tailwind `@apply`           |

## 📝 **その他参考記事**

* [Svelte Components as Web Components（Medium 記事）](https://medium.com/@yesmeno/svelte-components-as-web-components-b400d1253504)
* [Hacker News の Web Components と SSR 議論](https://news.ycombinator.com/item?id=33828039)

## 🔔 **要点の覚え書き**

* **Web Components = CSR 完了後に有効化される "部品単位の isolation 用途"**
* **Scoped CSS = Svelte / UnoCSS などのセレクタ管理によるスコープ "風"**
* `@apply` も Scoped CSS と同じカテゴリ：セレクタに依存。
* SSR/SSG を重視するなら Web Components 化しないほうが適する。
* SEO・初期描画・パフォーマンス重視のユースケースでは "普通のコンポーネント構造 + SSR/SSG" が良い選択。


✍️ **この知識はサービス設計・アーキテクチャ選定の判断基準として極めて役立つ。今後も繰り返し確認できるよう、Markdown として記録。**
