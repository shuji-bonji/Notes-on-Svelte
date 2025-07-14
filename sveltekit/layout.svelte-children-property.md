# SvelteKitの+layout.svelteにおけるchildrenプロパティ

## childrenとは何か

`+layout.svelte`の`children`は、**そのレイアウトに属する子コンポーネント（ページや下位のレイアウト）**を表すSnippetです。

## 重要：SvelteKitの特殊ファイルと通常のコンポーネントの違い

### 通常のSvelteコンポーネント

```svelte
<!-- 親: src/routes/+page.svelte など -->
<script lang="ts">
  import Child from '$lib/components/Child.svelte';
</script>

<!-- 親が明示的にpropsを渡す -->
<Child name={'hoge'} age={20} />
```

```svelte
<!-- 子: src/lib/components/Child.svelte -->
<script lang="ts">
  // 親から渡された値を受け取る
  let { name, age } = $props();
</script>

<p>{name}: {age}</p>
```

### SvelteKitの特殊ファイル（+page.svelte、+layout.svelte）

```typescript
// src/routes/products/[id]/+page.ts
export const load = async ({ params }) => {
  return {
    product: await getProduct(params.id)
  };
};
```

```svelte
<!-- src/routes/products/[id]/+page.svelte -->
<script lang="ts">
  // ❌ 親コンポーネントから渡されるのではない！
  // ✅ load関数から自動的に渡される
  let { data } = $props();
</script>
```

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  // childrenはSvelteKitが自動的に注入
  let { children, data } = $props();
</script>
```

## データフローの違い

### 通常のコンポーネント
```
親コンポーネント
    ↓ (明示的にpropsを渡す)
<Child name="hoge" age={20} />
    ↓
子コンポーネント（Child.svelte）
```

### SvelteKitの特殊ファイル
```
+layout.ts (load関数)
    ↓ (SvelteKitが自動的に渡す)
+layout.svelte
    ↓ (childrenとして自動的に含まれる)
配下の+page.svelte ← +page.ts (load関数から自動注入)
```

## ディレクトリ構造と対応関係

```
src/
├── routes/
│   ├── +layout.svelte        // ルートレイアウト（特殊ファイル）
│   ├── +page.svelte         // / のページ（特殊ファイル）
│   ├── about/
│   │   ├── +page.svelte     // /about のページ
│   │   └── team/
│   │       └── +page.svelte // /about/team のページ
│   └── products/
│       ├── +layout.svelte   // /products 配下のレイアウト
│       ├── +page.svelte     // /products のページ
│       └── [id]/
│           └── +page.svelte // /products/[id] のページ
└── lib/
    └── components/          // 通常のコンポーネント置き場
        ├── Button.svelte
        ├── Card.svelte
        └── Modal.svelte
```

## 具体的な例で理解する

### ルートレイアウト（/routes/+layout.svelte）

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Header from '$lib/components/Header.svelte'; // 通常のコンポーネント
  
  interface Props {
    children?: Snippet;
    data: LayoutData; // +layout.tsから
  }
  
  let { children, data }: Props = $props();
  
  // childrenの中身をデバッグ
  $inspect(children);
</script>

<div class="app-layout">
  <!-- 通常のコンポーネントは明示的にpropsを渡す -->
  <Header user={data.user} />
  
  <main>
    <!-- ここに各ページの内容が自動的に入る -->
    {@render children?.()}
  </main>
  
  <footer>
    <p>© 2025 My App</p>
  </footer>
</div>
```

### 各URLでchildrenに入る内容

#### 1. `/`にアクセスした場合

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  
  // load関数から自動的に渡される
  let { data } = $props();
</script>

<h1>ホームページ</h1>
<!-- 通常のコンポーネントは明示的に使う -->
<Card title="Welcome" content={data.welcomeMessage} />
```

**この`+page.svelte`の内容全体が`children`として渡される**

## なぜこのような仕組みなのか

| 項目 | 通常のコンポーネント | +page/+layout |
|-----|-------------------|--------------|
| 配置場所 | `$lib`など任意の場所 | `routes`ディレクトリ内の決められた場所 |
| import | 必要 | 不要（SvelteKitが自動処理） |
| props | 親が明示的に渡す | SvelteKitが自動的に注入 |
| 用途 | UI部品の再利用 | ページ/レイアウトの定義 |
| data prop | なし（任意のprops） | load関数から自動注入 |
| children | 通常のslot | レイアウトの場合は配下のページ |

## 実践的な使用例

### 認証付きレイアウト（特殊ファイルと通常コンポーネントの組み合わせ）

```svelte
<!-- src/routes/(authenticated)/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import LoginPrompt from '$lib/components/LoginPrompt.svelte'; // 通常のコンポーネント
  
  interface Props {
    children?: Snippet;
    data: {
      user?: User;
    };
  }
  
  let { children, data }: Props = $props();
  
  // 認証チェック
  $effect(() => {
    if (!data.user && $page.url.pathname !== '/login') {
      goto('/login');
    }
  });
</script>

{#if data.user}
  <div class="authenticated-layout">
    <nav>
      <span>ようこそ、{data.user.name}さん</span>
      <button onclick={() => goto('/logout')}>ログアウト</button>
    </nav>
    
    <!-- 認証が必要なページの内容が自動的に入る -->
    {@render children?.()}
  </div>
{:else}
  <!-- 通常のコンポーネントは明示的に使う -->
  <LoginPrompt message="このページを見るにはログインが必要です" />
{/if}
```

## childrenのライフサイクル

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    children?: Snippet;
  }
  
  let { children }: Props = $props();
  let renderCount = $state(0);
  
  // ナビゲーション時の動作を観察
  $effect(() => {
    renderCount++;
    console.log(`レイアウトレンダリング回数: ${renderCount}`);
  });
  
  // childrenが変わるタイミングを検知
  $effect(() => {
    console.log('childrenが更新されました');
    // 注: children自体は同じ参照のまま、中身が変わる
  });
</script>

<div>
  <p>レンダリング回数: {renderCount}</p>
  {@render children?.()}
</div>
```

## Angularとの比較

```typescript
// Angular - 通常のコンポーネント
@Component({
  selector: 'app-user-card',
  template: `<div>{{name}}: {{age}}</div>`
})
export class UserCardComponent {
  @Input() name: string;
  @Input() age: number;
}

// Angular - ルーティング
@Component({
  template: `
    <header>...</header>
    <router-outlet></router-outlet>  <!-- SvelteKitのchildrenに相当 -->
    <footer>...</footer>
  `
})
```

## まとめ

`+layout.svelte`の`children`は：

1. **その階層以下のページコンテンツ**を表すSnippet
2. **SvelteKitが自動的に注入**（通常のコンポーネントのpropsとは異なる）
3. **URLが変わると自動的に中身が切り替わる**
4. **ネスト可能**（レイアウトの中にレイアウト）
5. **通常のコンポーネントとは明確に異なる仕組み**

重要な理解：
- ✅ `+layout.svelte`の`children` = 配下の`+page.svelte`の内容（SvelteKitが自動注入）
- ✅ `+page.svelte`の`data` = load関数から渡されるデータ（親からではない）
- ✅ 通常のコンポーネントのprops = 親コンポーネントが明示的に渡す

この違いを理解することで、SvelteKitのルーティングシステムとコンポーネントシステムの使い分けが明確になります。