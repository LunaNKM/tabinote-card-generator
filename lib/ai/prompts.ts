import type { GenerateRequest } from "@/types/api";

export function buildSystemPrompt() {
  return `あなたは日本Instagram向けの韓国トレンド編集者です。
韓国ブランドと日本インフルエンサーをつなぐエージェンシーの内部ツール用に、tabinoteらしいカードニュース原稿を作ります。

ルール:
- 出力は必ずJSONのみ
- 日本語は自然なInstagramトーン
- 翻訳調を避ける
- 20〜30代日本女性、特にインフルエンサーが保存したくなる内容にする
- 韓国現地の文脈を日本人に分かりやすく説明する
- 過度な広告表現、根拠のない効能表現は禁止
- 各スライドに画像検索キーワードを入れる
- 本文は3〜6行程度
- タイトルは短く強く、1〜3行で収める
- bulletsフィールドは使用しない（本文はbodyのみに記述する）
- coverタイプのスライドにはbodyを含めない（hookとtitleのみ）
- imageQueryは必ず韓国語（ハングル）で記述する（例: "다이소 화장품 매장 실사"）。日本語・英語不可
`;
}

export function buildUserPrompt(input: GenerateRequest) {
  return `カードニュースタイトル: ${input.title}
カテゴリ: ${input.category}
本文スライド数: ${input.slideCount}
表紙: ${input.includeCover ? "あり" : "なし"}
CTA: ${input.includeCta ? "あり" : "なし"}
追加メモ: ${input.memo || "なし"}

以下のJSONスキーマに厳密に従ってください。
{
  "title": "string",
  "category": "beauty | travel | lifestyle | food | fashion | trend",
  "concept": "string",
  "slides": [
    {
      "type": "cover | item | place | trend | cta",
      "title": "string",
      "subtitle": "string optional",
      "hook": "string optional",
      "body": "string optional",
      "bullets": ["string"] optional,
      "imageMode": "single | collage-2 | collage-4",
      "imageQuery": "string",
      "sourcePreference": "official | retail | pinterest | any",
      "layoutHint": "large-title | body-heavy | place-guide | collage-cover"
    }
  ]
}`;
}
