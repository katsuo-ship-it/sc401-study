/**
 * SC-401 問題自動生成スクリプト
 * (2026年4月27日改訂版の試験範囲に対応)
 *
 * 使い方:
 *   node scripts/generate-questions.mjs --domain protect --count 10 --type single
 *   node scripts/generate-questions.mjs --domain dlp --count 10 --type fillblank
 *   node scripts/generate-questions.mjs --domain risk --count 5 --type matching
 *
 * --domain: protect | dlp | risk
 * --count:  生成する問題数（デフォルト: 10）
 * --type:   single | multi | matching | ordering | fillblank （デフォルト: single）
 *
 * 環境変数:
 *   ANTHROPIC_API_KEY: Claude APIキー
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DATA = path.join(__dirname, '..', 'src', 'data');

// ---- CLI引数パース ----
const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
};

const DOMAIN = get('--domain') ?? 'protect';
const COUNT = parseInt(get('--count') ?? '10', 10);
const TYPE = get('--type') ?? 'single';

const DOMAIN_FILE_MAP = {
  protect: 'questions-protect.ts',
  dlp: 'questions-dlp.ts',
  risk: 'questions-risk.ts',
};

const DOMAIN_EXPORT_MAP = {
  protect: 'protectQuestions',
  dlp: 'dlpQuestions',
  risk: 'riskQuestions',
};

const DOMAIN_PREFIX_MAP = {
  protect: 'protect',
  dlp: 'dlp',
  risk: 'risk',
};

// SC-401 (2026-04-27) サブドメインリスト
const SUBDOMAINS = {
  // 情報保護の実装 (30-35%)
  protect: [
    // データ分類の実装と管理
    '機密情報タイプ', 'カスタム機密情報タイプ', 'ドキュメントフィンガープリンティング',
    'EDMベース機密情報タイプ', 'トレーニング可能な分類子', 'データエクスプローラー',
    'コンテンツエクスプローラー', 'OCRサポート',
    // 秘密度ラベルの実装と管理
    '秘密度ラベルの役割と権限', '秘密度ラベルの定義', '保護設定とコンテンツマーキング',
    '秘密度ラベル公開ポリシー', '自動ラベリングポリシー', 'コンテナへの秘密度ラベル適用',
    'Defender for Cloud Apps による秘密度ラベル適用',
    // Windows・ファイル共有・Exchangeの情報保護
    '情報保護クライアント', '情報保護スキャナー', 'Purview メッセージ暗号化',
    'Advanced Message Encryption',
  ],
  // DLP・保持の実装 (30-35%)
  dlp: [
    // DLPポリシーの作成と構成
    'DLPポリシー設計', 'DLPの役割と権限', 'DLPポリシーの作成と管理',
    'アダプティブ保護のDLP', 'ポリシーとルールの優先順位', 'Defender for Cloud Apps ファイルポリシー',
    // エンドポイントDLPの実装と監視
    'エンドポイントDLPデバイス要件', 'デバイスの高度なDLPルール', 'エンドポイントDLP設定',
    'ジャストインタイム保護', 'エンドポイントアクティビティの監視',
    // 保持の実装と管理
    '保持ラベルの計画', 'アダプティブポリシースコープ', 'データライフサイクル管理保持ラベル',
    '保持ラベルポリシーの公開', '保持ラベルの自動適用', 'ポリシー優先順位とポリシー検索',
    '保持ポリシーの作成と構成', 'Microsoft 365 の保持コンテンツの回復',
  ],
  // リスク・アラート・アクティビティの管理 (30-35%)
  risk: [
    // インサイダーリスク管理の実装と管理
    'インサイダーリスク管理の役割と権限', 'インサイダーリスク管理コネクタ',
    'Microsoft Defender for Endpoint との統合', 'インサイダーリスク管理設定',
    'ポリシーインジケーター', 'ポリシーテンプレート', 'インサイダーリスクポリシー',
    'フォレンジック証拠設定', 'アダプティブ保護のインサイダーリスクレベル',
    'インサイダーリスクのアラートとケース', '通知テンプレート',
    // 情報セキュリティのアラートとアクティビティの管理
    'Purview 監査プレミアムライセンス', 'Purview 監査による調査', '監査保持ポリシー',
    'アクティビティエクスプローラー', 'DLPアラートへの対応', 'インサイダーリスクアクティビティの調査',
    'Microsoft Defender XDR での Purview アラート対応', 'Defender for Cloud Apps アラート',
    'コンテンツ検索',
    // AI サービスで使用されるデータの保護
    'Microsoft Purview AI コントロール', 'Microsoft 365 生産性ワークロードの AI 保護',
    'DSPM for AI の前提条件', 'DSPM for AI の役割と権限',
    'DSPM for AI ポリシー', 'DSPM for AI のアクティビティ監視',
  ],
};

// ---- 既存IDを取得 ----
function getExistingIds(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(/id:\s*['"]([^'"]+)['"]/g) ?? [];
  return matches.map((m) => m.replace(/id:\s*['"]|['"]/g, ''));
}

// ---- 次のIDシーケンス番号を取得 ----
function getNextSeq(existingIds, prefix) {
  const nums = existingIds
    .filter((id) => id.startsWith(prefix + '-'))
    .map((id) => parseInt(id.split('-').pop(), 10))
    .filter((n) => !isNaN(n));
  return nums.length > 0 ? Math.max(...nums) + 1 : 1;
}

// ---- プロンプト構築 ----
function buildPrompt(domain, type, count, existingIds, nextSeq) {
  const prefix = DOMAIN_PREFIX_MAP[domain];
  const subdomains = SUBDOMAINS[domain];

  const idExamples = Array.from({ length: count }, (_, i) =>
    `${prefix}-${String(nextSeq + i).padStart(3, '0')}`
  ).join(', ');

  const domainNames = {
    protect: '情報保護の実装（Implement information protection）',
    dlp: 'DLP・保持の実装（Implement data loss prevention and retention）',
    risk: 'リスク・アラート・アクティビティの管理（Manage risks, alerts, and activities）',
  };

  const typeInstructions = {
    single: `"type": "single" の問題を生成。"options" に4つの選択肢（A.〜D.）、"correctAnswers" に正解インデックス1つ（0-3）。`,
    multi: `"type": "multi" の問題を生成。"options" に4〜5つの選択肢、"correctAnswers" に正解インデックス2つ（複数選択問題）。問題文に「2つ選んでください」と明記。`,
    matching: `"type": "matching" の問題を生成。"matchingLeft" に4項目、"matchingRight" に4項目、"matchingCorrect" に正しい組み合わせ（left と right のペア配列）。"correctAnswers": [] とする。`,
    ordering: `"type": "ordering" の問題を生成。"orderingItems" に6〜7個の手順（正解以外のダミーを含む）、"orderingSelectCount" に選ぶ数（4〜5）、"orderingCorrect" に正しい順序の配列。"correctAnswers": [] とする。`,
    fillblank: `"type": "fillblank" の問題を生成。
      - "fillBlankTemplate": 空欄を {{1}}, {{2}} 等で示した文章
      - "fillBlankBlanks": [{ "placeholder": "{{1}}", "answer": "正解" }, ...] の配列
      - "fillBlankOptions": 正解 + ダミーを合わせた選択肢配列（合計4〜6個）
      - "correctAnswers": [] とする。
      空欄は1〜2箇所。`,
  };

  return `あなたはMicrosoft SC-401試験（Microsoft Information Security Administrator）の問題作成専門家です。

以下の条件で問題を${count}問生成してください。

【試験名】SC-401: Administering Information Security in Microsoft 365
【ドメイン】${domainNames[domain]}
【問題タイプ】${typeInstructions[type]}
【サブドメイン候補】${subdomains.join('、')}（均等にカバーすること）
【ID範囲】${idExamples}（この順序で使用）
【既存ID（重複禁止）】${existingIds.slice(0, 30).join(', ')}

【出力形式】
以下のJSON配列のみを出力してください（コードブロック不要、JSON以外のテキスト不要）。

[
  {
    "id": "${prefix}-${String(nextSeq).padStart(3, '0')}",
    "domain": "${domain}",
    "subdomain": "サブドメイン名",
    "type": "${type}",
    "question": "問題文（日本語）",
    "correctAnswers": [],
    "explanation": "詳細な解説"
  }
]

【品質基準】
- 問題文・解説はすべて日本語
- 解説は100文字以上で実践的な内容を含む（なぜ正解なのか、他の選択肢がなぜ不正解なのかを含む）
- SC-401本番試験レベルの難易度（Microsoft Purview、Azure、M365の具体的な機能名を使用）
- 既存問題と重複する内容は避ける
- 選択肢はA. B. C. D. の形式`;
}

// ---- TSファイルに追記 ----
function appendToTsFile(filePath, newQuestions) {
  let content = fs.readFileSync(filePath, 'utf8');
  const insertPoint = content.lastIndexOf('];');
  if (insertPoint === -1) {
    console.error('ファイルの末尾 ]; が見つかりません');
    process.exit(1);
  }

  const qStrings = newQuestions.map((q) => {
    const lines = ['  {'];
    lines.push(`    id: '${q.id}',`);
    lines.push(`    domain: '${q.domain}',`);
    lines.push(`    subdomain: '${q.subdomain}',`);
    lines.push(`    type: '${q.type}',`);
    lines.push(`    question: ${JSON.stringify(q.question)},`);

    if (q.options) {
      lines.push(`    options: [`);
      q.options.forEach((o) => lines.push(`      ${JSON.stringify(o)},`));
      lines.push(`    ],`);
    }
    if (q.correctAnswers !== undefined) {
      lines.push(`    correctAnswers: [${q.correctAnswers.join(', ')}],`);
    }
    if (q.matchingLeft) {
      lines.push(`    matchingLeft: [${q.matchingLeft.map((s) => JSON.stringify(s)).join(', ')}],`);
      lines.push(`    matchingRight: [${q.matchingRight.map((s) => JSON.stringify(s)).join(', ')}],`);
      lines.push(`    matchingCorrect: [`);
      q.matchingCorrect.forEach((p) => {
        lines.push(`      { left: ${JSON.stringify(p.left)}, right: ${JSON.stringify(p.right)} },`);
      });
      lines.push(`    ],`);
    }
    if (q.orderingItems) {
      lines.push(`    orderingItems: [${q.orderingItems.map((s) => JSON.stringify(s)).join(', ')}],`);
      lines.push(`    orderingSelectCount: ${q.orderingSelectCount},`);
      lines.push(`    orderingCorrect: [${q.orderingCorrect.map((s) => JSON.stringify(s)).join(', ')}],`);
    }
    if (q.fillBlankTemplate) {
      lines.push(`    fillBlankTemplate: ${JSON.stringify(q.fillBlankTemplate)},`);
      lines.push(`    fillBlankBlanks: [`);
      q.fillBlankBlanks.forEach((b) => {
        lines.push(`      { placeholder: ${JSON.stringify(b.placeholder)}, answer: ${JSON.stringify(b.answer)} },`);
      });
      lines.push(`    ],`);
      lines.push(`    fillBlankOptions: [${q.fillBlankOptions.map((s) => JSON.stringify(s)).join(', ')}],`);
    }
    lines.push(`    explanation: ${JSON.stringify(q.explanation)},`);
    lines.push('  },');
    return lines.join('\n');
  });

  const insertion = '\n' + qStrings.join('\n') + '\n';
  content = content.slice(0, insertPoint) + insertion + content.slice(insertPoint);
  fs.writeFileSync(filePath, content, 'utf8');
}

// ---- メイン ----
async function main() {
  if (!DOMAIN_FILE_MAP[DOMAIN]) {
    console.error(`Invalid domain: ${DOMAIN}. Use protect | dlp | risk`);
    process.exit(1);
  }
  if (!['single', 'multi', 'matching', 'ordering', 'fillblank'].includes(TYPE)) {
    console.error(`Invalid type: ${TYPE}. Use single | multi | matching | ordering | fillblank`);
    process.exit(1);
  }

  const filePath = path.join(SRC_DATA, DOMAIN_FILE_MAP[DOMAIN]);
  const existingIds = getExistingIds(filePath);
  const prefix = DOMAIN_PREFIX_MAP[DOMAIN];
  const nextSeq = getNextSeq(existingIds, prefix);

  console.log(`ドメイン: ${DOMAIN}`);
  console.log(`タイプ: ${TYPE}`);
  console.log(`生成数: ${COUNT}`);
  console.log(`既存問題数: ${existingIds.length}`);
  console.log(`開始ID: ${prefix}-${String(nextSeq).padStart(3, '0')}`);
  console.log('Claude APIに問題生成をリクエスト中...\n');

  const client = new Anthropic();
  const prompt = buildPrompt(DOMAIN, TYPE, COUNT, existingIds, nextSeq);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

  let questions;
  try {
    const jsonText = rawText.replace(/```json\n?|```\n?/g, '').trim();
    questions = JSON.parse(jsonText);
  } catch (e) {
    console.error('JSONパースエラー。レスポンス内容:');
    console.error(rawText.slice(0, 500));
    process.exit(1);
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    console.error('問題が生成されませんでした');
    process.exit(1);
  }

  console.log(`${questions.length}問を生成しました。ファイルに追記中...`);
  appendToTsFile(filePath, questions);
  console.log(`完了: ${filePath}`);
  console.log(`追記後の問題数: ${existingIds.length + questions.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
