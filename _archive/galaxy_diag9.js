// 检查当前 dial 布局 + 弹窗触发点
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('=== 1. dial 数量 ===');
const dials = html.match(/class="dial dial-\d"/g) || [];
console.log('dial 数量:', dials.length);

console.log('\n=== 2. dial 位置 CSS ===');
['dial-1','dial-2','dial-3','dial-4','dial-5','dial-6','dial-7'].forEach(c => {
  const idx = html.indexOf('.' + c + ' {');
  console.log(c, idx >= 0 ? '✅ ' + html.slice(idx, idx + 60).split('\n')[0] : '❌ 未定义');
});

console.log('\n=== 3. dial label ===');
for (let i = 1; i <= 7; i++) {
  const dIdx = html.indexOf('class="dial dial-' + i + '"');
  if (dIdx >= 0) {
    const seg = html.slice(dIdx, dIdx + 300);
    const m = seg.match(/d-label">([^<]+)</);
    console.log('dial-' + i, '=', m ? m[1] : '?');
  }
}

console.log('\n=== 4. 弹窗触发点 ===');
const triggers = [
  'setTimeout(maybeShowReview',
  "review-modal').classList.add('open')",
  "getElementById('review-modal').classList.add('open')",
  "maybeShowReview()"
];
triggers.forEach(t => {
  console.log(t, html.includes(t) ? '⚠️ 存在!' : '✅ 无');
});

console.log('\n=== 5. 周回顾 modal HTML 是否在 ===');
console.log('review-modal div:', html.includes('id="review-modal"') ? '存在' : '无');

// 6. 旧卫星残留
console.log('\n=== 6. 旧卫星残留 ===');
console.log((html.match(/class="sat sat-/g) || []).length, '个');
