# HTML `<template>` とコードスニペットの違いと、Svelteらしいテンプレートパターン

## ✅ 使い分けの比較表

| 特徴 | HTML `<template>` | コードスニペット（snippet） |
|---|---|---|
| 主な用途 | **動的なDOM生成** | **コードの再利用例・共有** |
| 実行タイミング | JavaScriptから明示的に `cloneNode()` などで使う | コンパイル対象外。表示や教育、開発時のコピペ用途 |
| DOMへの影響 | 初期状態では描画されない（非表示） | DOMとは無関係（通常はMarkdownやIDEで利用） |
| パラメータによる変化 | 可（JSで変数展開などに利用） | 不可（固定のコード例） |
| Svelte内での扱い | `<template>` は基本的に使わない（代替は `{#each}` や `<svelte:fragment>`） | Svelte開発とは直接関係しない（ドキュメント・補助用途） |


## 🔁 Svelteでのテンプレート的再利用パターン

### 1. `{#each}` を使った繰り返し

```svelte
<script>
  const items = [
    { id: 1, title: 'タイトル1', description: '説明1' },
    { id: 2, title: 'タイトル2', description: '説明2' }
  ];
</script>

{#each items as item (item.id)}
  <Card title={item.title} description={item.description} />
{/each}
```

### 2. `<slot>` を使ったコンポーネント化

```svelte
<!-- Card.svelte -->
<div class="card">
  <h2><slot name="title" /></h2>
  <p><slot name="desc" /></p>
</div>
```

```svelte
<!-- 使用側 -->
<Card>
  <span slot="title">タイトル</span>
  <span slot="desc">説明テキスト</span>
</Card>
```

### 3. `<svelte:fragment>` を使って柔軟な構造を提供

```svelte
<!-- Layout.svelte -->
{#if showHeader}
  <svelte:fragment slot="header" />
{/if}
<main>
  <slot />
</main>
```


## ✅ 結論

- HTML `<template>` は、Svelteでは通常使わない。
- **宣言的にテンプレート的な構造を表現できるのがSvelteの強み。**
- 再利用可能なUI構造には `{#each}`、コンポーネント、`<slot>`、`<svelte:fragment>` を活用する。
