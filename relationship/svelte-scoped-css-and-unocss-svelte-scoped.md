# SvelteのScoped CSSとUnoCSS Svelte Scoped


## SvelteのScoped CSSの仕組み

Svelteの通常のScoped CSSは、実際には**完全なカプセル化ではありません**：

```svelte
<!-- Component.svelte -->
<div class="my-class">Hello</div>

<style>
  .my-class {
    color: red;
  }
</style>

<!-- コンパイル後 -->
<div class="my-class svelte-xyz123">Hello</div>

<style>
  .my-class.svelte-xyz123 {
    color: red;
  }
</style>
```

## UnoCSS Svelte Scopedの`:global()`使用理由

UnoCSS Svelte Scopedは、Svelteのデフォルトのハッシュ方式を回避するために`:global()`ラッパーを使用し、代わりにファイル名+クラス名のハッシュを使用してユニークなクラス名を生成します。

```svelte
<!-- 実際の動作 -->
<div class="mb-1">Hello</div>

<style>
  /* UnoCSS Svelte Scopedが生成 */
  :global(.uno-abc123) {
    margin-bottom: 0.25rem;
  }
</style>

<!-- HTMLは以下に変換される -->
<div class="uno-abc123">Hello</div>
```

## Shadow DOMとの比較

### Shadow DOM（完全なカプセル化）
```javascript
// Web Components
const shadow = this.attachShadow({ mode: 'closed' });
// 外部からは一切アクセス不可
```

### Svelte Scoped CSS（擬似的なカプセル化）
- CSSセレクタにハッシュを追加
- グローバル空間に存在するが、衝突を防ぐ
- 親からの継承は受ける（color、fontなど）

### UnoCSS Svelte Scoped（戦略的なグローバル化）
- スタイルはグローバルだが、ユニークな名前により衝突を防ぎ、親要素の属性（`dark`、`rtl`など）に依存するスタイルも動作する

## なぜ完全なカプセル化をしないのか？

1. **親子関係の必要性**
   ```svelte
   <!-- 親コンポーネント -->
   <div class="dark">
     <ChildComponent /> <!-- dark:text-white が効く必要がある -->
   </div>
   ```

2. **レイアウトの相互作用**
   子要素間のスペーシング（`space-x-1`など）のように、コンポーネント間でスタイルが相互作用する必要がある

3. **パフォーマンスとDX**
   - Shadow DOMは重い
   - スタイルの継承が複雑
   - 開発ツールでのデバッグが困難

## 結論
SvelteもUnoCSS Svelte Scopedも「擬似的なスコープ」であり、Shadow DOMのような真のカプセル化ではありません。しかし、これは**意図的な設計判断**です：

- **実用性** > 完全な分離
- **柔軟性** > 厳格なカプセル化
- **パフォーマンス** > 理論的な純粋性
