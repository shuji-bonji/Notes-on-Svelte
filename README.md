# Svelte / SvelteKit メモ

## チートシート TypeScript版

### Svelte
- [Svelte チートシート（Basic）- TypeScript版](./cheatsheet/basic-svelte-cheat-sheet-typescript-edition.md)
- [Svelte チートシート（Advanced） - TypeScript版](./cheatsheet/advanced-svelte-cheat-sheet-typescript-edition.md)

### SvelteKit
- [SvelteKit チュートリアル対応 TypeScript補完チートシート](./cheatsheet/typescript-sveltekit-tutorial-cheatsheet.md)

## チートシート
### Svelte
- [Svelte チートシート（Basic）](./cheatsheet/basic-svelte-cheat-sheet.md)
- [Svelte チートシート（Advanced）](./cheatsheet/advanced-svelte-cheat-sheet.md)

### SvelteKit
- [SvelteKit チートシート（Basic）](./cheatsheet/basic-sveltekit-cheat-sheet.md)
- [SvelteKit チートシート（Advanced）](./cheatsheet/advanced-sveltekit-cheat-sheet.md)


## アンチパターン集

### Svelte
- [Svelte 5 アンチパターン集](./svelte/svelte-anti-patterns.md)
### SvelteKit
- [SvelteKit アンチパターン集](./sveltekit/sveltekit-anti-patterns.md)



## Svelte
- [`<script>` と `<script module>` の違い](./svelte/script-module.md)
- [Rune の使用ガイドライン（Svelte 5）](./svelte/rune-usage-guidelines.md)
- [$stateとProxyオブジェクト](./svelte/state-and-proxy-objects.md)
- [$state: リアクティブな状態変数と、バインディングの違い](./svelte/reactive-state-variables-vs-bindings.md)
- [$state.raw() vs $state()の違いと使い分け](./svelte/raw-state-explained.md)
- [$derived と $effect の違い](./svelte/derived-vs-effect.md)
- [アクションの`use:`と、DOMイベントに関数を割り当てとの違い](./svelte/action-use-vs-function-to-a-dom-event.md)
- [$props.id() とは](./svelte/props.id.md)
- [カスタムエレメントと通常のSvelteコンポーネントの違い](./svelte/custom-elements-and-components.md)
- [Svelte のビルトインリアクティブクラスまとめ](./svelte/built-in-reactive-classes.md)
- [Svelte/SvelteKit におけるストアの基礎と実践](./svelte/about-the-store.md)
- [@renderディレクティブとSnippetオブジェクト、#snippetディレクティブ](./svelte/render-directive-snippet-object-snippet-directive.md)
- [HTML `<template>` とコードスニペットの違い、Svelte的なテンプレートパターン](./svelte/html-templates-and-snippets.md)
- [`{@attach}` の使い方と用途](./svelte/attach.md)
## SvelteKit
- [SvelteKit JavaScript → TypeScript 変換ガイド](./sveltekit/sveltekit-javascript-typescript-conversion-guide.md)
- [SvelteKit ファイル構成の役割と実行環境](./sveltekit/sveltekit-files-explanation.md)
- [SvelteKit ルーティング規則に基づくファイル](./sveltekit/files-based-on-routing-conventions.md)
- [SvelteKitの+layout.svelteにおけるchildrenプロパティ](./sveltekit/layout.svelte-children-property.md)
- [SvelteKit `+server.ts`の使いよう](./sveltekit/how-to-use+server.ts.md)
   - [ジャンケンゲームでの +server.ts 活用例](./sveltekit/example-of-using-+server.ts-in-a-rock-paper-scissors-game.md)
- [SvelteKit Adapter 選定フローチャート](./sveltekit/sveltekit-adapter-selection-flowchart.md)
- [`+page.ts` と `+page.server.ts` における `load()` 関数の違い](/sveltekit/the-load-function-in+page.ts-and+page.server.ts.md)
- [+page.ts と +page.server.ts の実行タイミングと責任範囲図解](./sveltekit/load-function-sequence-diagrams.md)
- [SvelteKit でのセッション管理](./sveltekit/session-management-in-sveltekit.md)
- [`Cannot find module '$lib/*' or its corresponding type declarations.js(2307)`のメッセージが出たら。](./sveltekit/error-message-2307.md)
- [SvelteKit の use:enhance は、form の送信を interceptしてリクエストに置き換える](./sveltekit/use:enhance.md)
- [SvelteKit の PageOptions 属性比較](./sveltekit/pageoptions.md)
- [SvelteKit の LinkOptions 属性比較](./sveltekit/linkoptions.md)
- [SvelteKit `depends()` の完全解説](./sveltekit/depends.md)
- [`invalidate()`() と `invalidateAll()` の違い](./sveltekit/invalidateAll-and-invalidate.md)
- [SvelteKit の `$env` モジュール比較と使い分け](./sveltekit/env.md)


## 比較
- [React と Svelte 5、Next.js と SvelteKit の決定的な違い](./comparison/react-and-svelte5-next_js-and-sveltekit.md)
- [React / Svelte / Next.js / SvelteKit の背景・沿革・エコシステム比較](./comparison/background.md)
- [SvelteKit の企業採用実績例 と Next.js / SvelteKit 採用傾向比較](./comparison/recruitment-record.md)
- [特定業種における Next.js / SvelteKit 採用適性比較](./comparison/recruitment-for-specific-industries.md)
- [Meta と Vercel の背景・比較](./comparison/supporting-companies.md)
- [Meta と Vercel の資本関係・投資家・市場戦略比較](./comparison/capital-relationship.md)
- [仮想DOMとShadow DOMはなぜ重いのか？](./comparison/why-virtual-dom-and-shadow-dom-so-heavy.md)

### アーキテクチャ
- [SPA vs SSR: 2025年のWebアーキテクチャトレンド](./sveltekit/spa-vs-ssr-trend-analysis.md)
- [SPAとSSRの潮流と構成の選択肢](./sveltekit/spa-and-ssr-trends-and-configuration-options.md)
- [PWA + SSR + SPA Web開発の新次元](./sveltekit/pwa+ssr+spa-a-new-dimension-in-web-development.md)
- [PWA + SSR + SPA ハイブリッド構成](./sveltekit/pwa-ssr-hybrid-analysis.md)
- [SvelteKit におけるレイヤードアーキテクチャ対応のイメージ](./sveltekit/sveltekit-and-layered-architecture-1.md)
- [Sveltekitとレイヤードアーキテクチャー](./sveltekit/sveltekit-and-layered-architecture-2.md)

### SPA

- [SPA経験者のためのSvelteKit理解](./sveltekit/spa-vs-sveltekit-architecture.md)
- [SPA経験者のためのSvelteKit理解(html)](./sveltekit/spa-vs-sveltekit-architecture.html)
- [Angular vs Svelte のイベントハンドリング比較](./sveltekit/angular-vs-svelte-event-handling-comparison.md)


## テスト

## 関係
- [Svelte（SvelteKit含む）とTailwind CSS](./relationship/svelte-and-tailwind-css.md)
- [Web Components と Svelte/Tailwind/UnoCSS における整理と考察](./relationship/web-components-and-svelte-tailwind-unocss.md)

