// 仪表盘式 v12：中央大圆 + 7 个板块 dial 均匀环绕（360°/7）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 替换 dial 位置 CSS（环绕分布） ============
// 找位置 CSS 块
const posStart = html.indexOf('  /* 位置：左 2 个 + 右 2 个（小圆环绕大圆） */');
const posEnd = html.indexOf('  /* 金色连接线', posStart);
if (posStart < 0 || posEnd < 0) { console.log('❌ 位置 CSS 未找到'); process.exit(1); }

// 7 个位置：上、右上、右下、下、左下、左上（均匀 360/7 ≈ 51.4°）
const newPos = `  /* 位置：7 个板块均匀环绕（360°/7 ≈ 51.4°） */
  .dial-1 { top: -4%; left: 50%; transform: translateX(-50%); }
  .dial-2 { top: 10%; right: -2%; }
  .dial-3 { bottom: 14%; right: 2%; }
  .dial-4 { bottom: -6%; left: 50%; transform: translateX(-50%); }
  .dial-5 { bottom: 14%; left: 2%; }
  .dial-6 { top: 10%; left: -2%; }
  .dial-7 { top: 30%; right: 22%; }

`;
html = html.slice(0, posStart) + newPos + html.slice(posEnd);
console.log('✅ 7 个板块环绕位置已定义');

// ============ 2. 替换 dial HTML（7 个板块） ============
const oldDialsStart = html.indexOf('  <!-- 左右仪表盘小圆 -->');
const oldDialsEnd = html.indexOf('  <!-- 中央核心 -->');
if (oldDialsStart < 0 || oldDialsEnd < 0) { console.log('❌ dial HTML 未找到'); process.exit(1); }

const newDials = `  <!-- 7 个板块仪表盘小圆（环绕） -->
  <div class="dial dial-1" data-drawer="d1" onclick="openDrawer('d1', this)">
    <span class="d-ic">📚</span>
    <div class="d-num" id="dial-num-1">0</div>
    <div class="d-label">学业</div>
  </div>
  <div class="dial dial-2" data-drawer="d2" onclick="openDrawer('d2', this)">
    <span class="d-ic">💼</span>
    <div class="d-num" id="dial-num-2">0</div>
    <div class="d-label">工作</div>
  </div>
  <div class="dial dial-3" data-drawer="d7" onclick="openDrawer('d7', this)">
    <span class="d-ic">🤖</span>
    <div class="d-num" id="dial-num-3">0</div>
    <div class="d-label">对话</div>
  </div>
  <div class="dial dial-4" data-drawer="d5" onclick="openDrawer('d5', this)">
    <span class="d-ic">🌐</span>
    <div class="d-num" id="dial-num-4">0</div>
    <div class="d-label">工具</div>
  </div>
  <div class="dial dial-5" data-drawer="d3" onclick="openDrawer('d3', this)">
    <span class="d-ic">🏠</span>
    <div class="d-num" id="dial-num-5">0</div>
    <div class="d-label">生活</div>
  </div>
  <div class="dial dial-6" data-drawer="d4" onclick="openDrawer('d4', this)">
    <span class="d-ic">🧠</span>
    <div class="d-num" id="dial-num-6">0</div>
    <div class="d-label">知识库</div>
  </div>
  <div class="dial dial-7" data-drawer="d6" onclick="openDrawer('d6', this)">
    <span class="d-ic">📓</span>
    <div class="d-num" id="dial-num-7">0</div>
    <div class="d-label">日记</div>
  </div>

`;
html = html.slice(0, oldDialsStart) + newDials + html.slice(oldDialsEnd);
console.log('✅ 7 个板块 dial 已生成');

// ============ 3. 手机端 dial 位置适配 ============
const oldMobileDial = `    .dial { width: clamp(92px, 24vw, 120px); height: clamp(92px, 24vw, 120px); }`;
const newMobileDial = `    .dial { width: clamp(78px, 20vw, 100px); height: clamp(78px, 20vw, 100px); }
    .dial-1 { top: -3%; }
    .dial-4 { bottom: -4%; }
    .dial-2 { top: 12%; right: -3%; }
    .dial-6 { top: 12%; left: -3%; }
    .dial-3 { bottom: 12%; right: 0; }
    .dial-5 { bottom: 12%; left: 0; }
    .dial-7 { top: 30%; right: 18%; }`;
if (html.includes(oldMobileDial)) {
  html = html.replace(oldMobileDial, newMobileDial);
  console.log('✅ 手机端 dial 位置适配');
}

// ============ 4. 更新 SVG 连接线（连到 7 个位置） ============
// 简化：保留同心圆 + 增加几条对角线
const oldSvg = `<svg class="galaxy-links" viewBox="0 0 880 640" preserveAspectRatio="none">
    <line x1="440" y1="320" x2="100" y2="140" stroke="rgba(212,175,106,0.25)" stroke-width="1"/>
    <line x1="440" y1="320" x2="140" y2="480" stroke="rgba(212,175,106,0.25)" stroke-width="1"/>
    <line x1="440" y1="320" x2="780" y2="140" stroke="rgba(212,175,106,0.25)" stroke-width="1"/>
    <line x1="440" y1="320" x2="740" y2="480" stroke="rgba(212,175,106,0.25)" stroke-width="1"/>
    <circle cx="440" cy="320" r="210" fill="none" stroke="rgba(212,175,106,0.12)" stroke-width="1"/>
    <circle cx="440" cy="320" r="250" fill="none" stroke="rgba(212,175,106,0.08)" stroke-width="1" stroke-dasharray="4 8"/>
  </svg>`;
const newSvg = `<svg class="galaxy-links" viewBox="0 0 880 640" preserveAspectRatio="none">
    <line x1="440" y1="320" x2="440" y2="80" stroke="rgba(212,175,106,0.22)" stroke-width="1"/>
    <line x1="440" y1="320" x2="820" y2="170" stroke="rgba(212,175,106,0.22)" stroke-width="1"/>
    <line x1="440" y1="320" x2="760" y2="480" stroke="rgba(212,175,106,0.22)" stroke-width="1"/>
    <line x1="440" y1="320" x2="440" y2="600" stroke="rgba(212,175,106,0.22)" stroke-width="1"/>
    <line x1="440" y1="320" x2="120" y2="480" stroke="rgba(212,175,106,0.22)" stroke-width="1"/>
    <line x1="440" y1="320" x2="60" y2="170" stroke="rgba(212,175,106,0.22)" stroke-width="1"/>
    <line x1="440" y1="320" x2="640" y2="120" stroke="rgba(212,175,106,0.16)" stroke-width="1"/>
    <circle cx="440" cy="320" r="200" fill="none" stroke="rgba(212,175,106,0.12)" stroke-width="1"/>
    <circle cx="440" cy="320" r="255" fill="none" stroke="rgba(212,175,106,0.08)" stroke-width="1" stroke-dasharray="4 8"/>
  </svg>`;
if (html.includes(oldSvg)) {
  html = html.replace(oldSvg, newSvg);
  console.log('✅ SVG 连接线已更新（7 条）');
} else {
  console.log('⚠️ SVG 未匹配');
}

// ============ 5. 加 dial 数量统计同步脚本 ============
const countScript = `
  function syncDialCounts() {
    // 学业=待办+追踪, 工作=项目, 对话=消息, 工具=应用, 生活=睡眠/喝水, 知识库=知识, 日记=日记数
    try {
      const t = store.get('cg_todos') || [];
      const p = store.get('cg_projects') || [];
      const j = store.get('cg_journal') || [];
      const s = store.get('cg_splits') || [];
      const nums = {
        'dial-num-1': t.length + (s.length || 0),
        'dial-num-2': p.length,
        'dial-num-3': 'AI',
        'dial-num-4': (store.get('cg_apps') || []).length,
        'dial-num-5': 0,
        'dial-num-6': (store.get('cg_clubs') || []).length + (store.get('cg_courses_v2') || []).length,
        'dial-num-7': j.length
      };
      for (const [id, v] of Object.entries(nums)) {
        const el = document.getElementById(id);
        if (el) el.textContent = v;
      }
    } catch(e) {}
  }
  setInterval(syncDialCounts, 3000);
`;
// 注入到星系同步脚本里（找 syncDDL 的 setInterval 后面）
const anchor = '  setInterval(syncDDL, 2000);';
if (html.includes(anchor)) {
  html = html.replace(anchor, anchor + '\n' + countScript);
  console.log('✅ dial 数量统计已加入');
} else {
  console.log('⚠️ 同步锚点未找到');
}

// ============ 6. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

// 确认 7 个 dial
const dialCount = (html.match(/class="dial dial-\d"/g) || []).length;
console.log('dial 数量:', dialCount, dialCount === 7 ? '✅' : '❌');

fs.writeFileSync(path, html);
console.log('\n✅ v12 完成！大小:', (html.length / 1024).toFixed(1), 'KB');
