# ルートグループ (auth)/ の仕組み

SvelteKit の **ルートグループ `()`** と **`guard` や `interceptor` 的な仕組み** の関係について詳しく説明します。

## 🔹 ルートグループ `(auth)/` の仕組み

以下のように `()` で囲ったディレクトリ名は **グルーピング用（構造上の整理用）** であり、
📎 **URL には影響しません**。

```plaintext
src/routes/
├── (auth)/               
│   ├── login/    → `/login`
│   └── register/ → `/register`
```

✅ つまり **「URL には `/auth` という部分は含まれず、見た目だけのフォルダ整理」** です。

## 🔹 guard / interceptor 的挙動は？

SvelteKit には **「公式の `guard` / `interceptor` 機能」は存在しません**。
しかし以下のように実装できます：

### 1️⃣ **`+layout.server.ts` / `+layout.ts` を使った guard 的処理**

例えば、`(auth)/` ルートに共通の `+layout.server.ts` を置けば、
その中で `session` チェック（認証・認可）を行い、リダイレクトなどができます。

```plaintext
src/routes/
├── (auth)/
│   ├── +layout.server.ts  ← ここに guard 的処理
│   ├── login/
│   └── register/
```

この `+layout.server.ts` は `(auth)/` 配下の全ページに適用されます。

### 2️⃣ **guard 的処理の実装例**

```ts
// src/routes/(auth)/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }

  return { user };
};
```

このように **`+layout.server.ts` が `guard` の役割を果たす** ことになります。

## 🔹 設定場所まとめ

| 用途            | 設定場所                                           |
| ------------- | ---------------------------------------------- |
| 認証チェック（guard） | `+layout.server.ts` または `+layout.ts`（ページ単位もOK） |
| API 認証        | `+server.ts` 内で直接 `locals` などを確認               |

✅ **ポイントまとめ**

* `()` はフォルダ整理のためだけ → URL には出ない。
* `guard` / `interceptor` は `+layout.server.ts` を該当グループに配置して実装する。
* `locals` に認証情報をセットしておけば、 `load` で確認できる。

