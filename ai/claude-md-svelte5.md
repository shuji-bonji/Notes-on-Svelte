# CLAUDE.md - Svelte5/SvelteKit TypeScript開発ガイドライン

## プロジェクト概要

このプロジェクトは「SPA経験者の為の Svelte5/SvelteKit 道場」として、TypeScriptを基準としたSvelte5/SvelteKitの学習コンテンツを提供します。

### 対象読者
- TypeScript/JavaScriptを利用したWebサービス開発経験者
- SPA/WebAPI系開発が主体でSSR/SSGは不慣れなエンジニア
- Svelteの公式チュートリアルを見ながら開発しているが、TypeScriptの情報が少なく苦労している人

## 重要な開発指針

### 1. Svelte5の最新文法の使用（必須）

**Svelte5のRunes APIを必ず使用してください。** 古いSvelte4以前の文法は使用禁止です。

```typescript
// ❌ 古い文法（使用禁止）
let count = 0;
$: doubled = count * 2;

// ✅ Svelte5の新しい文法（必須）
let count = $state(0);
let doubled = $derived(count * 2);
```

### 2. TypeScriptの型安全性の徹底

すべてのコードはTypeScriptで記述し、以下の規則を守ってください：

#### 型定義の基本ルール
- `any`型の使用は禁止（やむを得ない場合は`unknown`を使用）
- すべての関数の引数と戻り値に型を明示
- Svelteコンポーネントのpropsは必ず型定義を行う

```typescript
// ✅ 良い例
interface ButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Svelte5のprops定義
let { text, onClick, disabled = false }: ButtonProps = $props();
```

#### SvelteKitの型定義
- `PageLoad`、`PageServerLoad`、`RequestHandler`などの型を必ず使用
- `load`関数、`actions`、`hooks`には適切な型を付ける

```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // 型安全なコード
};

// +page.server.ts
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  // 型安全なコード
};

export const actions: Actions = {
  default: async ({ request }) => {
    // 型安全なフォーム処理
  }
};
```

### 3. Svelte5固有の機能の活用

以下のSvelte5の新機能を積極的に使用してください：

- `$state()` - リアクティブな状態管理
- `$derived()` - 計算されたリアクティブ値
- `$effect()` - 副作用の処理（useEffectの代替）
- `$props()` - コンポーネントのprops定義
- `$bindable()` - 双方向バインディング可能なprops
- `$inspect()` - デバッグ用（開発環境のみ）

### 4. ファイル構成とネーミング規則

```
src/
├── routes/
│   ├── +layout.svelte
│   ├── +layout.ts
│   └── (group)/
│       ├── +page.svelte
│       ├── +page.ts
│       └── +page.server.ts
├── lib/
│   ├── components/
│   │   └── Button.svelte
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
└── app.d.ts
```

### 5. コンポーネント作成の規則

```svelte
<script lang="ts">
  // 1. 型定義のインポート
  import type { ComponentProps } from './types';
  
  // 2. Svelte5のprops定義（型付き）
  interface Props {
    title: string;
    count?: number;
    onUpdate?: (value: number) => void;
  }
  
  let { title, count = 0, onUpdate }: Props = $props();
  
  // 3. リアクティブな状態（$state使用）
  let internalCount = $state(count);
  
  // 4. 派生状態（$derived使用）
  let doubled = $derived(internalCount * 2);
  
  // 5. 副作用（$effect使用）
  $effect(() => {
    console.log(`Count changed to: ${internalCount}`);
  });
  
  // 6. イベントハンドラー（型付き）
  const handleClick = (): void => {
    internalCount++;
    onUpdate?.(internalCount);
  };
</script>

<!-- HTMLテンプレート -->
```

### 6. エラーハンドリングとバリデーション

- フォームバリデーションには`zod`や`valibot`などの型安全なライブラリを使用
- エラーは適切な型で定義し、ユーザーフレンドリーなメッセージを表示

```typescript
import { z } from 'zod';
import type { Actions } from './$types';

const userSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください')
});

export const actions: Actions = {
  createUser: async ({ request }) => {
    const formData = await request.formData();
    const result = userSchema.safeParse(Object.fromEntries(formData));
    
    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors
      };
    }
    
    // 処理を続行
  }
};
```

### 7. 参照すべきドキュメント

開発時は必ず以下の公式ドキュメントを参照してください：

- [Svelte5 LLMドキュメント](https://svelte.dev/docs/llms)
- [Svelte5 日本語LLMドキュメント](https://svelte.jp/docs/llms)
- [SvelteKit公式ドキュメント](https://kit.svelte.dev/docs)

### 8. コード例の提供方法

学習コンテンツでコード例を提供する際は：

1. 必ずTypeScriptで記述
2. 型定義を省略しない
3. コメントで重要なポイントを説明
4. Svelte4以前の書き方との違いを明示（必要に応じて）

### 9. よくある間違いと対処法

```typescript
// ❌ 間違い：古いストア記法
import { writable } from 'svelte/store';
const count = writable(0);

// ✅ 正解：Svelte5のstate
let count = $state(0);

// ❌ 間違い：型定義なし
export function processData(data) {
  return data.map(item => item.value);
}

// ✅ 正解：適切な型定義
export function processData<T extends { value: number }>(data: T[]): number[] {
  return data.map(item => item.value);
}
```

### 10. パフォーマンスとベストプラクティス

- 不要な再レンダリングを避けるため、`$derived`を適切に使用
- 大きなリストには`{#each}`のkey属性を必ず指定
- サーバーサイドとクライアントサイドの処理を適切に分離

## 注意事項

- **Svelte5未満の文法は絶対に使用しないでください**
- **すべてのコードにTypeScriptの型を付けてください**
- **`any`型の使用は禁止です**
- **公式ドキュメントの最新情報を常に確認してください**

このガイドラインに従って、型安全で最新のSvelte5/SvelteKitコードを提供してください。