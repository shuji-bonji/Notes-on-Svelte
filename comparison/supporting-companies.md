# 📝 Meta と Vercel の背景・比較

## 1️⃣ Meta の背景

- **正式名称:** Meta Platforms, Inc.（旧 Facebook Inc.）
- **設立:** 2004年（Facebook として設立）
- **本社:** 米国 カリフォルニア州 メンローパーク
- **主な事業:**
  - SNS（Facebook, Instagram）
  - メッセージング（WhatsApp, Messenger）
  - 広告プラットフォーム
  - VR/AR（Reality Labs: Oculus など）
- **OSS 活動:**
  - **React:** UI ライブラリとして 2013 年にオープンソース化
  - **React Native:** モバイルクロスプラットフォーム
  - **その他 OSS:** Immutable.js, Jest, Relay など

🔔 **特徴:**
- **グローバル巨大プラットフォーマーとしての立場**
- **OSS 活動は主に社内利用ツールを公開する形**
- **Meta 自身の利益や技術ロードマップの一環として React を維持**


## 2️⃣ Vercel の背景

- **正式名称:** Vercel Inc.（旧 Zeit Inc.）
- **設立:** 2015年
- **本社:** 米国 カリフォルニア州 サンフランシスコ
- **主な事業:**
  - **Next.js の公式開発・維持（OSS でありつつ、商用戦略中核）**
  - **Vercel プラットフォーム:** 静的・動的サイトのホスティング最適化サービス
  - Edge Network, ISR, Functions など CDN / Edge 寄りの商用サービス
- **OSS 活動:**
  - **Next.js:** フルスタック Web フレームワーク
  - **SWR, TurboPack などフロントエンド向けツール群**
  - 2021年 Rich Harris（Svelte 創設者）を雇用、Svelte / SvelteKit のスポンサー支援

🔔 **特徴:**
- **OSS と商用サービスが密結合した企業戦略**
- **Next.js は「Vercel プラットフォーム最適化」を目指すフラッグシップ OSS**
- **近年は Svelte/SvelteKit への積極的支援も進め、OSS 支援企業としての存在感強化**


## 3️⃣ Meta と Vercel の比較

| 項目 | Meta | Vercel |
| --- | --- | --- |
| **設立年** | 2004年 | 2015年 |
| **企業規模** | 超大企業（従業員数数万人、売上数十兆円規模） | スタートアップ（成長企業、従業員数数百人規模） |
| **主な収益モデル** | 広告プラットフォーム収益 | ホスティング・Edge/CDN サービス収益 |
| **OSS へのスタンス** | 社内ツール OSS 化（自己利用・改善主目的） | OSS に基づく商用ホスティング最適化（Next.js/SvelteKit など） |
| **代表的 OSS** | React, React Native, Jest など | Next.js, SWR, TurboPack など（+ SvelteKit へのスポンサー支援） |
| **主な顧客層** | SNS ユーザ（B2C ビジネス主体） | 開発者・企業（B2B SaaS ビジネス主体） |


## 4️⃣ 背景まとめ

✅ **Meta の背景とスタンス**
- React を「自社プロダクト改善目的」で OSS として公開。
- 社内需要ドリブンなメンテナンス。
- 超巨大企業ならではの安定支援・長期性。

✅ **Vercel の背景とスタンス**
- OSS（Next.js / SvelteKit 等）を「自社商用ホスティングと結びつけて最適化」。
- OSS が商用事業の基盤なので、コミュニティフレンドリーかつ投資的。
- 近年 SvelteKit への資金・リソース支援で存在感強化。


## 🎯 結論

- **Meta と Vercel はともに OSS に多大な影響を与えるが、出発点と戦略が異なる。**
  - **Meta:** SNS プラットフォーマーであり、自社サービス支援としての React。
  - **Vercel:** OSS（Next.js など）をサービス展開の中心に据える SaaS 企業。