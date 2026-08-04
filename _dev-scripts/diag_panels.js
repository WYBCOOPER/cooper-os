// 查 COOPER OS 真实板块结构（有多少个板块/模块）
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 找所有板块的 header/标题
console.log('=== 顶部 Tab/导航板块 ===');
const tabs = html.match(/data-tab="[^"]*"|tab-btn[^>]*>[^<]*</g) || [];
tabs.forEach(t => console.log(' ', t.slice(0, 60)));

// 找板块容器（常见 id: d1-d7 或 panel）
console.log('\n=== 板块容器 ===');
['d1','d2','d3','d4','d5','d6','d7'].forEach(d => {
  const idx = html.indexOf('id="' + d + '"');
  if (idx >= 0) {
    const after = html.slice(idx, idx + 400);
    // 找板块标题（第一个 h2/h3/strong/em）
    const title = after.match(/<h[23][^>]*>([^<]{2,30})</) || after.match(/<strong[^>]*>([^<]{2,30})</) || after.match(/<em[^>]*>([^<]{2,30})</);
    console.log(d, '→', title ? title[1] : '(标题未找到)');
  }
});

// 找 nav 里的条目
console.log('\n=== 导航条目 ===');
const nav = html.match(/nav-item[^>]*>\s*[^<]*<[^>]*>\s*([^<]{1,20})/g) || [];
nav.forEach(n => console.log(' ', n.replace(/\s+/g,' ').slice(0, 70)));

// 顶部 tab 区
const tabIdx = html.indexOf('class="tab');
if (tabIdx >= 0) {
  console.log('\n=== Tab 区片段 ===');
  console.log(html.slice(tabIdx, tabIdx + 600).replace(/\n/g, ' ').slice(0, 600));
}
