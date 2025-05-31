# SvelteKit チュートリアル対応 TypeScript補完チートシート

このチートシートは、[SvelteKit公式チュートリアル](https://svelte.dev/tutorial)に沿って、JavaScriptで記述されているコードに対し、**TypeScriptでの型補完や推奨記法を追記した対応表**です。


## 基本構成

| チュートリアル                         | JavaScript                                     | TypeScript補完                                                                                                        |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `+page.ts` の load関数             | `export const load = async () => {}`           | `import type { PageLoad } from './$types';`<br>`export const load: PageLoad = async () => {}`                       |
| `+page.server.ts` の load関数      | `export const load = async ({ params }) => {}` | `import type { PageServerLoad } from './$types';`<br>`export const load: PageServerLoad = async ({ params }) => {}` |
| formデータ取得                       | `formData.get('name')`                         | `const name = formData.get('name') as string;` または null チェック付きで安全に扱う                                                |
| `+page.server.ts` の actions     | `export const actions = {}`                    | `import type { Actions } from './$types';`<br>`export const actions: Actions = {}`                                  |
| `export const prerender = true` | `export const prerender = true`                | 型付け不要（型推論される）                                                                                                       |


## 📁 `$types` の使い方

SvelteKitでは、各ファイルに応じて自動的に `$types` という型定義が生成されます。

```ts
// +page.server.ts
import type { PageServerLoad, Actions } from './$types';
```

> `./$types` をインポートすることで、params や formData の型補完が有効になります。

---

## よくあるエラーとその対応（TS編）

| エラー内容                      | 原因                                                  | 解決策                                         |
| -------------------------- | --------------------------------------------------- | ------------------------------------------- |
| `load` 関数に型がなく補完が効かない      | 型推論が効かない                                            | `PageLoad` や `PageServerLoad` を明示的に指定       |
| `formData.get()` の戻り値の型エラー | `FormData.get()` は `FormDataEntryValue \| null` を返す | `as string` キャスト、または null チェックが必要           |
| `page.data` に期待する型がつかない    | `load()` の戻り値に明示的型が必要                               | `load(): Promise<{ user: string }>` のように型付け |


## POSTアクションとバリデーション例

```ts
// +page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');

    if (typeof name !== 'string' || name.trim() === '') {
      return { success: false, error: '名前が必要です' };
    }

    return { success: true };
  }
};
```


## 参考
* [SvelteKit Docs - TypeScript](https://svelte.jp/docs/svelte/typescript)
* [SvelteKit の \$types とは？](https://kit.svelte.jp/docs/types#routing-advanced-modules-$types)
* [フォーム処理（アクション）の型指定](https://kit.svelte.jp/docs/form-actions)
