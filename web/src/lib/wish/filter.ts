// 杰個願望的自動過濾：不做人工審核，送出時比對下面的規則，符合任何一條就不公開。
// 被擋下的留言存成 rejected，後台看得到原因，誤擋的可以手動恢復；漏網的由檢舉與後台下架處理。
// 規則寧可具體：「垃圾分類」「能幹」「狗大便」這類正常用語不能被擋，所以單字只在明確的罵人句型裡才算。

export type BlockReason = "profanity" | "attack" | "hate" | "spam" | "pii" | "impersonation" | "gibberish";

export const BLOCK_REASON_LABEL: Record<BlockReason, string> = {
  profanity: "髒話、辱罵",
  attack: "攻擊、負評或其他候選人",
  hate: "仇恨或歧視用語",
  spam: "網址或廣告",
  pii: "個人資料",
  impersonation: "冒用候選人、官方或團隊名義",
  gibberish: "無意義或洗版",
};

/** 全形轉半形、轉小寫，去掉空白與常用來拆字的符號（「幹 你」「白.痴」） */
const compact = (s: string) =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s​-‏⁠﻿·•・._\-*~|/\\'"`^+=#&]+/g, "");

const any = (words: string) => new RegExp(words);

/** 髒話、辱罵（不論對象） */
const PROFANITY = [
  any(
    "幹你|幹妳|幹您|幹他|幹她|幹林|幹拎|幹恁|幹娘|幹爆|幹死|幹譙|你娘|恁娘|你媽的|妳媽的|他媽的|靠北|靠杯|靠腰|靠夭|機掰|機歪|雞掰|雞歪|機八|雞巴|鸡巴|屌你|操你|肏|草泥馬|尼瑪|傻逼|傻b|煞筆|白痴|白癡|智障(?![者礙])|腦殘|脑残|低能(?![耗源量])|北七|啥小|殺小|王八|混蛋|人渣|畜生|畜牲|賤人|賤貨|賤民|婊|狗屎|吃屎|吃大便|放屁|狗屁|屁話|去死|死全家|下地獄|fuck|fck|shit|bitch|asshole|wtf|stfu|cunt|🖕|💩",
  ),
  // 「幹」當髒話：接在對象前面，或單獨成句（「能幹、樹幹、一起幹、幹部、幹嘛」不算）
  /(?<![能才骨樹主苦實硬蠻精肯單巧軀躯])幹(?=你|妳|您|他|她|林|拎|恁|娘|爆|死|譙)/,
  /(^|[!?,。，！？、…])幹(?=$|[!?,。，！？、…])/,
];

/** 「對象＋（副詞）＋負面評價」：你很爛、世杰根本是垃圾、他是個騙子 */
const TARGET = "黃世杰|世杰|杰哥|黃律師|黃委員|候選人|你們|你|妳|您|他們|他|她|民進黨|國民黨|民眾黨|綠營|藍營|白營|dpp|kmt|tpp";
const ADVERB = "真的|就是|根本|超|很|好|也太|太|真|是|最|有夠|就|才|只是|只會|一個|個|一群|群|一堆|堆";
const NEGATIVE =
  "爛(?!尾)|垃圾(?![車桶場分袋問處量回清子])|廢物|廢(?![除止棄水氣物料土墟核票話])|無能|噁心|恶心|可悲|丟臉|無恥|虛偽|騙子|騙人|騙票|小丑|笑話|混蛋|不配(?![合套備置])|不要臉|沒用(?![到過完])|沒救|雜碎|敗類|走狗|奴才|豬(?![農肉場隻舍圈血排腳油])";

const ATTACK = [
  // 對象前面不能接「其、吉、利、排、迷」：「其他垃圾」「迷你」的「他、你」不是在指人
  new RegExp(`(?<![其吉利排迷])(${TARGET})(${ADVERB})*(${NEGATIVE})`),
  /(爛|垃圾|廢物|無能|噁心|可悲|無恥|虛偽|騙子|小丑|混蛋|雜碎|敗類|走狗|豬頭)(候選人|市長|律師|委員|政客|黨|議員)/,
  // 叫人下台、說政見是空話
  any("滾出|滾回|滾開|滾蛋|滾啦|滾吧|下台(?!階)|凍未條|凍抹條|凍袂條|唾棄|罷免|騙票|騙選票|空頭支票|畫大餅|芭樂票|作秀|吹牛|嘴砲|說說而已|口號而已"),
  // 「你只會說」才算；「我只會說謝謝你」不算
  new RegExp(`(?<![其吉利排迷])(${TARGET})(就|都|也)?只會(說|講|喊|開支票)`),
  // 唱衰選情；「一定不會落選」「怎麼可能輸」是支持者的鼓勵，不算
  /(?<!不會|不要|不能|不可能|可能|才不會|絕不|別|不)(落選|選不上|輸定|必輸)/,
  // 叫人不要投給候選人；「我不會投給別人」是支持，不算
  /(別|不要|不會|不想|拒|不)投(給)?(他|你|妳|黃|世杰|民進黨)/,
  // 其他候選人：這裡是給世杰加油、對桃園許願的地方，不開放比較或攻擊
  /張善政/,
];

/** 仇恨、歧視、政治標籤 */
const HATE = any("支那|台巴子|中國豬|台灣豬|阿六仔|塔綠班|綠蛆|綠共|藍白豬|藍白拖|舔共|賣台|賣國賊|外勞仔|番仔|黑鬼|死同性戀|娘炮|網軍");
/** 當標籤用的數字（「1450 滾」）：前後不能接數字、小數點或單位，「1450 萬元」「426 號」「14.50」都不算 */
const HATE_NUMBER = /(?<![\d.])(426|1450)(?![\d.]|\s*[萬千百億元號巷弄樓之人公年位戶件名個歲台輛次天小坪米%])/;

/** 廣告與網址：在原文上比對（網址需要句點） */
const URL = /https?:\/\/|www\.|lin\.ee|line\.me|t\.me|bit\.ly|reurl|\b[a-z0-9-]+\.(com|net|org|tw|cc|io|me|ly|co|xyz|top|info|shop|link|app|site|club)\b/;
const SPAM = any("娛樂城|博弈|百家樂|老虎機|運彩|代儲|代辦貸款|小額借貸|免審核|加賴|加line|加我line|私訊我|日賺|月入(\\d|[一二三四五六七八九十百千萬]|過|破|數)|投資群|飆股|在家兼職|外送茶|約砲|援交|裸聊|成人影片|代孕|虛擬貨幣投資|usdt|telegram|tg群");

/** 個人資料：手機、市話、身分證字號、email、LINE ID */
const PII = [
  /(?<!\d)09\d{2}[-\s]?\d{3}[-\s]?\d{3}(?!\d)/,
  /(?<!\d)\(?0[2-8]\d?[)\-\s]\s?\d{3,4}[-\s]?\d{3,4}(?!\d)/,
  /(?<![a-z])[a-z][12]\d{8}(?!\d)/,
  /[\w.+-]+@[\w-]+\.[\w.]+/,
  /(?<![a-z])line\s*(id)?\s*[:：]|賴\s*id/,
];

/** 顯示名稱不能冒用候選人、官方或團隊 */
const IMPERSONATION = any("黃世杰|世杰|杰哥|候選人|競選|官方|杰伴桃園|jie\\.?taoyuan|志工團隊|團隊|管理員|小編|admin|市長|市府|市政府");

export function checkText(text: string): BlockReason | null {
  const raw = text.normalize("NFKC").toLowerCase();
  const c = compact(text);
  if (PII.some((r) => r.test(raw))) return "pii";
  if (URL.test(raw) || SPAM.test(c)) return "spam";
  if (PROFANITY.some((r) => r.test(c))) return "profanity";
  if (HATE.test(c) || HATE_NUMBER.test(raw)) return "hate";
  if (ATTACK.some((r) => r.test(c))) return "attack";
  return null;
}

/** 整則留言：標題、內容、顯示名稱都要過；內容另外檢查洗版。個資最優先（因個資被擋的不保存原文） */
export function checkWish({ title, content, displayName }: { title: string; content: string; displayName: string }): BlockReason | null {
  const reason = checkText(`${displayName}\n${title}\n${content}`);
  if (reason === "pii") return reason;
  if (displayName && IMPERSONATION.test(compact(displayName))) return "impersonation";
  if (reason) return reason;
  const letters = compact(content).replace(/[!?,。，！？、…：:;；()（）「」『』【】]/g, "");
  // 同一個字連打 10 次以上，或幾乎沒有文字
  if (/(.)\1{9,}/u.test(letters) || !/[\p{L}\p{N}]{4,}/u.test(letters)) return "gibberish";
  return null;
}
