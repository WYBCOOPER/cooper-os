// 寻找"和中控台一样大的大圆球"的来源
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 1. 检查 ring-outer 残留（之前 v17 报告有残留）
console.log('=== 1. ring-outer / ring-inner 残留 ===');
const ringIdx = html.indexOf('ring-outer');
if (ringIdx >= 0) {
  console.log('找到 ring-outer @' + ringIdx);
  console.log(html.slice(Math.max(0, ringIdx - 300), ringIdx + 300));
} else {
  console.log('✅ 无 ring-outer');
}

// 2. 检查所有大尺寸圆形元素（border-radius 50% + 大尺寸）
console.log('\n=== 2. 大尺寸圆形元素 ===');
const circles = html.match(/(?:\.|#)[a-z0-9-]+\s*\{[^}]*border-radius:\s*50%[^}]*\}/g) || [];
circles.forEach(c => {
  const sizeMatch = c.match(/width:\s*[^;]+;|height:\s*[^;]+;/g);
  const sizes = sizeMatch ? sizeMatch.join(' ') : '?';
  console.log(' ', c.slice(0, 40), '...', '| 尺寸:', sizes.slice(0, 60));
});

// 3. 检查 galaxy-core 是否被定义了两次
console.log('\n=== 3. galaxy-core 定义次数 ===');
const coreDefs = html.match(/\.galaxy-core\s*\{/g) || [];
console.log('galaxy-core CSS 定义:', coreDefs.length, '次');
const coreHtml = html.match(/class="galaxy-core"/g) || [];
console.log('galaxy-core HTML 元素:', coreHtml.length, '个');

// 4. 检查 dial 尺寸（是不是某个 dial 尺寸异常大）
console.log('\n=== 4. dial CSS 尺寸 ===');
const dialDefs = html.match(/\.dial\s*\{[^}]*\}/g) || [];
dialDefs.forEach(d => {
  const w = d.match(/width:\s*[^;]+;/);
  const h = d.match(/height:\s*[^;]+;/);
  console.log(' ', w ? w[0] : '', h ? h[0] : '');
});

// 5. 检查 SVG circle（可能是大圆环）
console.log('\n=== 5. SVG 圆形元素 ===');
const svgCircles = html.match(/<circle[^>]*>/g) || [];
svgCircles.forEach(c => console.log(' ', c));

// 6. 检查是否有重复的 galaxy 容器
console.log('\n=== 6. galaxy 容器数量 ===');
const galaxyHtml = html.match(/class="galaxy"/g) || [];
console.log('galaxy 容器:', galaxyHtml.length, '个');

// 7. 检查 core-ring CSS 是否还有（v17 声称移除了）
console.log('\n=== 7. core-ring CSS ===');
const cr = html.match(/\.core-ring\s*\{[^}]*\}/g) || [];
console.log('core-ring CSS:', cr.length, cr.map(x => x.slice(0, 50)));
