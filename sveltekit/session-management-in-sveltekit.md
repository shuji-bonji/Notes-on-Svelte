# SvelteKit でのセッション管理

SvelteKit でのセッション管理は、設計次第で柔軟に対応できますが、SSR（サーバサイドレンダリング）とフロントエンドの統合という特徴から、Cookieベースのセッション管理が自然にマッチします。
一方、WebAPI（RESTなど）中心のSPA構成では、JWTベースの認証が一般的です。

ここでは、それぞれの特徴と、ブラウザ側の保存方法、サーバ側での扱い方を比較しながら説明します。

## 🔐 SvelteKitにおけるセッション・認証の選択肢

構成	主な利用技術	セッション維持	備考
SSR + Cookie	Cookie + HttpOnly	セッションID or JWT	サーバで状態を保持（もしくはJWTをサーバ側で検証）
SPA + REST API	JWT (access/refresh)	localStorage/sessionStorage or Cookie	フロントエンド主導、状態レスのAPI設計にマッチ


## 1. Cookieベースのセッション管理（SvelteKitに自然）

🔸ブラウザ側
	•	認証成功時、Set-CookieヘッダーでセッションIDやJWTをHttpOnly属性付きで付与
	•	SvelteKitのload関数やhooks.server.tsで、cookies.get()で読み取り可能
	•	セキュリティの観点から、**JSから直接読み取れない（HttpOnly）**のがメリット

🔸サーバ側
	•	Cookieに格納されたセッションIDやJWTをevent.cookies.get('session')などで読み出し、ユーザ情報に変換
	•	例えば、hooks.server.tsで以下のように使用：

// src/hooks.server.ts
export const handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');
  if (session) {
    // JWTを検証し、ユーザー情報をevent.localsに保存
    event.locals.user = verifyJWT(session);
  }
  return resolve(event);
};



## 2. JWT（accessToken + refreshToken）ベースの認証

🔸ブラウザ側

トークン	保存場所	特徴
accessToken	localStorage や memory	使いやすいがXSS耐性は弱い
refreshToken	Cookie (HttpOnly)	安全にするにはHttpOnlyなCookieが推奨される

	•	fetch()でAPI呼び出し時にAuthorization: Bearer <accessToken>をつける
	•	accessTokenが失効していたら、refreshToken（Cookie）を使って再発行

🔸サーバ側
	•	accessTokenの検証：署名チェックと有効期限チェック
	•	refreshTokenの検証と再発行：

// SvelteKit API Route例: /api/refresh-token/+server.ts
export const POST = async ({ cookies }) => {
  const refreshToken = cookies.get('refreshToken');
  if (!refreshToken) return new Response('Unauthorized', { status: 401 });

  const user = verifyRefreshToken(refreshToken);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const newAccessToken = createAccessToken(user);
  return new Response(JSON.stringify({ accessToken: newAccessToken }));
};



## 🔁 組み合わせのベストプラクティス（セキュアかつ快適）
	•	accessToken: JavaScript側でメモリにのみ保持（推奨）
	•	refreshToken: HttpOnly Cookieに保存（Secure + SameSite=Strict）
	•	認証が必要なAPI呼び出し時、accessTokenが失効していたら /api/refresh-token を自動で呼ぶように設計

## 💡 SvelteKitにおける実装イメージ

// src/hooks.server.ts
import { verifyJWT } from '$lib/auth';

export const handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session'); // または accessToken
  if (token) {
    const user = verifyJWT(token);
    if (user) event.locals.user = user;
  }
  return resolve(event);
};

// src/routes/+layout.server.ts
export const load = async ({ locals }) => {
  return { user: locals.user ?? null };
};


## ✅ 結論：どちらを使うべきか？

要件	推奨される方法
SSRでセッションが必要	Cookieベースセッション（HttpOnly）
SPA的にAPI中心設計	JWT（accessToken + refreshToken）
高セキュリティ（XSS・CSRF対策）	refreshTokenはCookie(HttpOnly, Secure)、accessTokenはmemory保持
SvelteKit単体で完結	Cookie + hooks.server.ts でユーザ管理


