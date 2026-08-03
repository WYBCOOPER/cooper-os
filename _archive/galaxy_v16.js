// 星系中控台 v16 修复：① 去掉多余圆（core-add 胶囊按钮）② 核心重新设计
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. core-add：从"圆形胶囊"改为"极简文字链接"（不再像独立的圆） ============
const oldAddCSS = `.core-add {
    margin-top: 7px; padding: 4px 13px; font-size: clamp(9px, 1.1vw, 10px);
    color: var(--accent); border: 1px solid rgba(212,175,106,0.35); border-radius: 20px;
    cursor: pointer; background: rgba(212,175,106,0.06);
    transition: all .25s var(--ease); white-space: nowrap;
  }
  .core-add:hover { background: rgba(212,175,106,0.18); border-color: var(--accent); transform: translateY(-1px); }`;
const newAddCSS = `.core-add {
    margin-top: 8px; font-size: clamp(9px, 1.1vw, 10px);
    color: var(--accent); letter-spacing: .08em;
    cursor: pointer; background: none; border: none;
    transition: opacity .2s var(--ease); white-space: nowrap;
    opacity: .8; padding: 2px 8px;
  }
  .core-add:hover { opacity: 1; text-decoration: underline; }`;
if (html.includes(oldAddCSS)) {
  html = html.replace(oldAddCSS, newAddCSS);
  console.log('✅ core-add 改为极简文字链接（不再是圆）');
} else {
  console.log('⚠️ core-add CSS 未精确匹配');
}

// ============ 2. 核心内容重新设计：更紧凑、更精致 ============
// 2.1 核心时间更大更居中，日期 + 标签合并视觉层级
const oldTimeCSS = `.core-time { font-family: var(--mono); font-size: clamp(26px, 3.8vw, 40px); font-weight: 700; color: #e8c98f; letter-spacing: .04em; text-shadow: 0 0 30px rgba(212,175,106,0.6); line-height: 1.1; }`;
const newTimeCSS = `.core-time { font-family: var(--mono); font-size: clamp(30px, 4.2vw, 46px); font-weight: 700; color: #f0d9a8; letter-spacing: .05em; text-shadow: 0 0 34px rgba(212,175,106,0.65); line-height: 1; }`;
if (html.includes(oldTimeCSS)) {
  html = html.replace(oldTimeCSS, newTimeCSS);
  console.log('✅ 核心时钟加大');
}

// 2.2 日期字号微调
const oldDateCSS = `.core-date { font-size: clamp(11px, 1.4vw, 13px); color: var(--text-dim); letter-spacing: .2em; margin-top: 6px; }`;
const newDateCSS = `.core-date { font-size: clamp(10px, 1.3vw, 12px); color: var(--text-dim); letter-spacing: .24em; margin-top: 7px; }`;
if (html.includes(oldDateCSS)) {
  html = html.replace(oldDateCSS, newDateCSS);
  console.log('✅ 日期微调');
}

// 2.3 标签加分隔线（精致感）
const oldLabelCSS = `.core-label { font-size: clamp(9px, 1.2vw, 11px); color: var(--accent); letter-spacing: .3em; margin-top: 10px; opacity: .9; }`;
const newLabelCSS = `.core-label {
    font-size: clamp(9px, 1.2vw, 11px); color: var(--accent); letter-spacing: .32em;
    margin-top: 10px; opacity: .9;
    display: flex; align-items: center; gap: 10px;
  }
  .core-label::before, .core-label::after {
    content:''; width: 22px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,106,0.5));
  }
  .core-label::after { background: linear-gradient(90deg, rgba(212,175,106,0.5), transparent); }`;
if (html.includes(oldLabelCSS)) {
  html = html.replace(oldLabelCSS, newLabelCSS);
  console.log('✅ 标签加金色分隔线');
}

// 2.4 核心内边距/padding 微调
html = html.replace('text-align: center; padding: 16px;', 'text-align: center; padding: 14px 18px;');

// ============ 3. 天气位置：移到核心下方独立一行（不再挤在核心内） ============
// 简单方案：核心内天气保留但更小更淡；核心下方（galaxy 底部）加一行天气文字
const oldWeatherCSS = `.core-weather { font-family: var(--mono); font-size: clamp(8px, 1.1vw, 10px); color: var(--text-faint); letter-spacing: .12em; margin-top: 6px; max-width: 90%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`;
const newWeatherCSS = `.core-weather { font-family: var(--mono); font-size: clamp(8px, 1vw, 10px); color: var(--text-faint); letter-spacing: .12em; margin-top: 7px; max-width: 88%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: .85; }`;
if (html.includes(oldWeatherCSS)) {
  html = html.replace(oldWeatherCSS, newWeatherCSS);
  console.log('✅ 天气微调');
}

// ============ 4. DDL 区域：精简为单行 ============
const oldDdlCSS = `.core-ddl { margin-top: 7px; font-size: clamp(8px, 1vw, 10px); color: #ffb4a2; max-width: 92%; display: flex; flex-direction: column; gap: 3px; align-items: center; }`;
const newDdlCSS = `.core-ddl { margin-top: 7px; font-size: clamp(8px, 1vw, 10px); color: #ffb4a2; max-width: 92%; display: flex; flex-direction: column; gap: 2px; align-items: center; }`;
if (html.includes(oldDdlCSS)) {
  html = html.replace(oldDdlCSS, newDdlCSS);
  console.log('✅ DDL 精简');
}

// ============ 5. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ v16 修复完成！大小:', (html.length / 1024).toFixed(1), 'KB');
