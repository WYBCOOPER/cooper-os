// 长久方案：applyServerData 加时间戳保护（拉取时不覆盖"本地比服务器新"的键）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 找到 applyServerData 里的关键逻辑
const oldLogic = `      Object.keys(data).forEach(k => {
        if (data[k] !== null && data[k] !== undefined) {
          try {
            // 跳过本地刚保存（5秒内）的键，防止覆盖联动结果
            const savedAt = parseInt(localStorage.getItem('cg_saved_' + k) || '0', 10);
            if (Date.now() - savedAt < 5000) return;
            const cur = localStorage.getItem(k);
            const next = JSON.stringify(data[k]);
            if (cur !== next) { localStorage.setItem(k, next); changed = true; }
          } catch {}
        }
      });`;

const newLogic = `      Object.keys(data).forEach(k => {
        if (data[k] !== null && data[k] !== undefined) {
          try {
            // 🔒 时间戳保护：跳过"本地比服务器新"的键（防旧数据覆盖新打卡）
            const savedAt = parseInt(localStorage.getItem('cg_saved_' + k) || '0', 10);
            if (Date.now() - savedAt < 30000) return; // 本地 30 秒内保存过 → 以本地为准
            // 服务器侧时间戳（如果服务器有 updatedAt 且比本地新才覆盖）
            const serverTs = data['cg_ts_' + k] || 0;
            const localTs = parseInt(localStorage.getItem('cg_ts_' + k) || '0', 10);
            if (serverTs > 0 && localTs > serverTs) return; // 本地更新 → 不覆盖
            const cur = localStorage.getItem(k);
            const next = JSON.stringify(data[k]);
            if (cur !== next) { localStorage.setItem(k, next); changed = true; }
          } catch {}
        }
      });`;

if (html.includes(oldLogic)) {
  html = html.replace(oldLogic, newLogic);
  console.log('✅ 同步逻辑已加时间戳保护（30 秒本地优先 + 时间戳比较）');
} else {
  console.log('⚠️ 同步逻辑未精确匹配，查找变体');
  const idx = html.indexOf('Object.keys(data).forEach(k => {');
  if (idx >= 0) {
    console.log('找到 @' + idx);
    console.log(html.slice(idx, idx + 600));
  }
}

// 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);

fs.writeFileSync(path, html);
console.log('✅ 完成');
