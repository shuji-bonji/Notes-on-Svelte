# SvelteKit `+server.ts`の使いよう

とても良い質問ですね！`+server.ts`の使い分けは、SvelteKitの設計思想を理解する上で重要なポイントです。実際には **`+server.ts`と`+page.ts`の併用は頻繁に行われます**！特に外部APIの橋渡しとして重要な役割を果たします。



## 🎯 `+server.ts` の主な使い分け

### 1. **外部APIの橋渡し/プロキシ** ⭐️ よく使う
```typescript
// src/routes/api/weather/+server.ts
export async function GET({ url }) {
  const city = url.searchParams.get('city');
  
  // 🔐 APIキーを隠蔽して外部API呼び出し
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather`, {
    headers: {
      'Authorization': `Bearer ${WEATHER_API_KEY}` // サーバーでのみ利用可能
    }
  });
  
  return json(await response.json());
}

// +page.ts では公開エンドポイント経由でアクセス
export const load = async ({ fetch }) => {
  // 🌍 ブラウザでも実行可能（APIキーが隠蔽される）
  const weather = await fetch('/api/weather?city=Tokyo');
  return { weather: await weather.json() };
};
```

### 2. **初期データ + 動的更新の組み合わせ** ⭐️ 頻繁に使う
```typescript
// +page.ts - 初期データ取得（ユニバーサル）
export const load = async ({ fetch }) => {
  // 🌍 初期ゲーム一覧を取得
  const games = await fetch('/api/games').then(r => r.json());
  return { initialGames: games };
};

// +server.ts - 動的API
export async function POST({ request }) {
  // 🔐 新しいゲーム作成（サーバーのみ）
  const gameData = await request.json();
  const game = await createGame(gameData);
  return json(game);
}

export async function GET() {
  // 🌍 公開ゲーム一覧（定期更新用）
  const games = await getPublicGames();
  return json(games);
}
```

### 3. **セキュリティ分離** ⭐️ 重要
```typescript
// +page.server.ts - 認証済みユーザーの初期データ
export const load = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/login');
  
  // 🔐 ユーザー専用データ
  return {
    user: locals.user,
    privateGameHistory: await getUserGameHistory(locals.user.id)
  };
};

// +server.ts - 公開API
export async function GET({ url }) {
  // 🌍 誰でもアクセス可能な公開データ
  const gameId = url.searchParams.get('id');
  const publicInfo = await getPublicGameInfo(gameId);
  return json(publicInfo);
}
```

 🎮 ジャンケンゲームでの実際の使い分け素晴らしい質問ですね！
 **`+server.ts`は外部API橋渡しで特に威力を発揮**し、ユニバーサルデータ取得と組み合わせて使うのが現実的なパターンです。

## 🎯 答え：**併用が基本、外部API橋渡しが主戦場**

### **実際の使い分け頻度**
1. **外部API橋渡し** ⭐️⭐️⭐️ (最も重要)
2. **動的なCRUD操作** ⭐️⭐️⭐️ 
3. **初期データ(`+page.ts`) + 動的更新(`+server.ts`)** ⭐️⭐️
4. **完全WebAPI型特化** ⭐️ (モバイルアプリ等向け)

## 🔑 **外部API橋渡しの重要性**

### なぜ `+server.ts` が必要？
```typescript
// ❌ +page.ts から直接外部API（問題あり）
export const load = async ({ fetch }) => {
  // 🚨 APIキーがブラウザに露出！
  // 🚨 CORS問題！
  // 🚨 レート制限管理できない！
  const weather = await fetch('https://api.openweathermap.org/weather', {
    headers: { 'Authorization': 'Bearer YOUR_SECRET_KEY' } // 🚨危険
  });
};

// ✅ +server.ts で橋渡し（安全）
// src/routes/api/weather/+server.ts
export async function GET({ url }) {
  const city = url.searchParams.get('city');
  
  // 🔐 APIキー隠蔽
  const response = await fetch(`https://api.openweathermap.org/weather`, {
    headers: { 'Authorization': `Bearer ${WEATHER_API_SECRET}` }
  });
  
  // 📊 レスポンス加工
  const data = await response.json();
  return json({
    temperature: data.main.temp,
    description: data.weather[0].description
    // 不要なデータは除外
  });
}

// ✅ +page.ts から安全にアクセス
export const load = async ({ fetch }) => {
  // 🌍 公開エンドポイント経由で取得
  const weather = await fetch('/api/weather?city=Tokyo');
  return { weather: await weather.json() };
};
```

## 🎮 **ジャンケンゲームでの実用例**

### **SMS/Email通知の橋渡し**
```typescript
// src/routes/api/notifications/+server.ts
export async function POST({ request }) {
  const { type, recipient, gameId } = await request.json();
  
  if (type === 'sms') {
    // 🔐 Twilio API橋渡し（APIキー隠蔽）
    await fetch('https://api.twilio.com/2010-04-01/...', {
      headers: { 'Authorization': `Basic ${TWILIO_SECRET}` }
    });
  }
  
  return json({ success: true });
}

// +page.svelte から呼び出し
async function sendInvitation() {
  await fetch('/api/notifications', {
    method: 'POST',
    body: JSON.stringify({
      type: 'sms',
      recipient: phoneNumber,
      gameId: game.id
    })
  });
}
```

## 🔄 **典型的な併用パターン**

### **パターン1: 初期データ + 動的更新**
```typescript
// +page.ts - 初期ゲーム一覧
export const load = async ({ fetch }) => {
  const games = await fetch('/api/games').then(r => r.json());
  return { initialGames: games };
};

// +server.ts - 新規作成API
export async function POST({ request }) {
  const gameData = await request.json();
  return json(await createGame(gameData));
}
```

### **パターン2: 認証データ + 公開API**
```typescript
// +page.server.ts - 認証済みユーザーデータ
export const load = async ({ locals }) => {
  return { user: locals.user };
};

// +server.ts - 公開ゲーム情報API
export async function GET({ params }) {
  return json(await getPublicGameInfo(params.id));
}
```

## ✅ **判断基準まとめ**

| 要件 | 選択するファイル | 理由 |
|------|----------------|------|
| 外部API利用（APIキー必要） | `+server.ts` | セキュリティ |
| 初期表示データ（公開） | `+page.ts` | SEO + パフォーマンス |
| 初期表示データ（認証必要） | `+page.server.ts` | セキュリティ + SSR |
| フォーム送信 | `+page.server.ts` actions | プログレッシブエンハンスメント |
| リアルタイム更新API | `+server.ts` | WebSocket等との連携 |
| モバイルアプリ向けAPI | `+server.ts` | 独立したAPI提供 |

## 🎯 **Angular開発者への対応表**

| Angular | SvelteKit | 主な用途 |
|---------|-----------|----------|
| HTTP Interceptor | `+server.ts` | 外部API橋渡し |
| Service (CRUD) | `+server.ts` | API提供 |
| Guard + Resolver | `+page.server.ts` | 認証+初期データ |
| OnInit データ取得 | `+page.ts` | 公開初期データ |

**結論**: `+server.ts`は「WebAPI型特化」よりも「**外部API橋渡し + 動的操作API**」として使うのが実用的で、ユニバーサルデータ取得との併用が王道パターンです！