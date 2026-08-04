// 重做第 2 步：按钮落日渐变 + 验证
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. .btn-primary 落日渐变 ============
const btnIdx = html.indexOf('.btn-primary {');
if (btnIdx >= 0) {
  const btnEnd = html.indexOf('\n  }', btnIdx) + 4;
  const newBtn = `.btn-primary {
    background: linear-gradient(135deg, #FF6B00, #FF8C00);
    color: #0B1220;
    border-radius: 12px;
    padding: 10px 22px;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(255,107,0,0.25);
    transition: transform .2s var(--ease), box-shadow .2s;
    cursor: pointer;
    border: none;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,107,0,0.35); }
  .btn-primary:active { transform: translateY(0) scale(0.98); }`;
  html = html.slice(0, btnIdx) + newBtn + html.slice(btnEnd);
  console.log('✅ .btn-primary 落日渐变');
} else { console.log('ℹ️ 无 .btn-primary（跳过）'); }

// ============ 2. 输入框冰川风 ============
const inpIdx = html.indexOf('.inline-input {');
if (inpIdx >= 0) {
  const inpEnd = html.indexOf('\n  }', inpIdx) + 4;
  const newInp = `.inline-input {
    background: rgba(16,24,40,0.6);
    border: 1px solid rgba(232,236,245,0.12);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--text);
    transition: border-color .2s, box-shadow .2s;
    outline: none;
  }
  .inline-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(143,184,232,0.15); }`;
  html = html.slice(0, inpIdx) + newInp + html.slice(inpEnd);
  console.log('✅ 输入框冰川风');
}

// ============ 3. 状态栏毛玻璃 ============
const sbIdx = html.indexOf('.statusbar {');
if (sbIdx >= 0) {
  const sbEnd = html.indexOf('\n  }', sbIdx) + 4;
  const newSb = `.statusbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; gap: 18px;
    padding: 14px 6px; margin-bottom: 8px;
    backdrop-filter: blur(24px);
    background: rgba(11,18,32,0.6);
    border-bottom: 1px solid rgba(232,236,245,0.06);
    font-size: 13px;
  }`;
  html = html.slice(0, sbIdx) + newSb + html.slice(sbEnd);
  console.log('✅ 状态栏毛玻璃');
}

// ============ 4. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ 按钮/输入框/状态栏已更新！大小:', (html.length / 1024).toFixed(1), 'KB');
