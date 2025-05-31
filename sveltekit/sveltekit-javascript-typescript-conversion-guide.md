# SvelteKit JavaScript → TypeScript 変換ガイド

## ファイル拡張子
```
+page.js → +page.ts
+page.server.js → +page.server.ts
+layout.js → +layout.ts
+layout.server.js → +layout.server.ts
```

## load関数の型付け

### JavaScript（チュートリアル）
```js
// +page.js
export const load = async ({ params }) => {
  return {
    title: 'ページタイトル'
  };
};
```

### TypeScript（変換後）
```ts
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  return {
    title: 'ページタイトル'
  };
};
```

### JavaScript（サーバー版）
```js
// +page.server.js
export const load = async ({ params, locals }) => {
  return {
    user: locals.user
  };
};
```

### TypeScript（変換後）
```ts
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  return {
    user: locals.user
  };
};
```

## フォームアクション

### JavaScript
```js
// +page.server.js
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    
    return { success: true };
  }
};
```

### TypeScript
```ts
// +page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string; // 型アサーション必要
    
    return { success: true };
  }
};
```

## コンポーネントprops

### JavaScript
```js
// Component.svelte
<script>
  export let title;
  export let count = 0;
</script>
```

### TypeScript
```ts
// Component.svelte
<script lang="ts">
  export let title: string;
  export let count: number = 0;
</script>
```

## APIエンドポイント

### JavaScript
```js
// +server.js
export async function GET() {
  return new Response('Hello');
}
```

### TypeScript
```ts
// +server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return new Response('Hello');
};
```

## 🔧 よくあるTypeScript化のポイント

### 1. FormDataの型安全性
```ts
// ❌ JavaScript風
const name = formData.get('name');

// ✅ TypeScript
const name = formData.get('name') as string;
// または null チェック
const name = formData.get('name');
if (typeof name !== 'string') {
  return { error: '名前が必要です' };
}
```

### 2. paramsの型定義
```ts
// 動的ルート: [slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const slug = params.slug; // 自動的に string 型
  return { slug };
};
```

### 3. fetch の型付け
```ts
interface GameData {
  id: string;
  title: string;
  players: string[];
}

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch('/api/games');
  const games: GameData[] = await response.json();
  return { games };
};
```

## 🎮 リアルタイムジャンケンゲーム用の型定義例

### 基本型定義
```ts
// src/lib/types.ts
export interface Player {
  id: string;
  name: string;
  choice?: 'rock' | 'paper' | 'scissors';
  isReady: boolean;
  wins: number;
}

export interface GameRoom {
  id: string;
  createdBy: string;
  maxPlayers: number;
  totalRounds: number;
  players: Player[];
  currentRound: number;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  expiresAt: Date;
}

export type Choice = 'rock' | 'paper' | 'scissors';
export type GameResult = 'win' | 'lose' | 'draw';
```

### ゲーム作成ページ
```ts
// src/routes/create/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import type { GameRoom } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
  // ユーザー認証チェック
  if (!locals.user) {
    return { user: null };
  }
  
  return {
    user: locals.user
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const maxPlayers = Number(formData.get('maxPlayers'));
    const totalRounds = Number(formData.get('totalRounds'));
    
    if (!maxPlayers || !totalRounds) {
      return {
        error: '参加人数と回数を正しく入力してください'
      };
    }
    
    // ゲーム作成ロジック
    const gameRoom: Partial<GameRoom> = {
      maxPlayers,
      totalRounds,
      status: 'waiting'
    };
    
    return { success: true, gameRoom };
  }
};
```

## 📚 TypeScript学習の進め方

### Phase 1: 基本変換（今すぐ）
1. ファイル拡張子を `.ts` に変更
2. `import type { PageLoad } from './$types';` を追加
3. 関数に型注釈を追加

### Phase 2: 型定義強化（今週中）
1. インターフェース定義の作成
2. カスタム型の活用
3. ジェネリクスの理解

### Phase 3: 高度な型活用（来週）
1. 条件型の活用
2. ユーティリティ型の使用
3. 型安全なイベントハンドリング

## 🛠️ 開発環境セットアップ

### TypeScript設定
```json
// tsconfig.json (SvelteKitが自動生成)
{
  "extends": "./.svelte-kit/tsconfig.json"
}
```

### VSCode推奨拡張機能
- Svelte for VS Code
- TypeScript Hero
- Error Lens
- Auto Rename Tag

## 🎯 次のステップ

1. **現在のチュートリアル**: この変換表を見ながら進行
2. **実践**: ジャンケンゲームで型安全性を実装
3. **習慣化**: 常にTypeScriptで書く癖をつける