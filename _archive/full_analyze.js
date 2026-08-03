// 全量分析 COOPER OS：提取所有 CSS 类名、组件结构、布局
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
const html = fs.readFileSync(path, 'utf8');

// 1. 提取所有 CSS 类定义
const cssClasses = [...new Set(html.match(/\.([a-zA-Z][\w-]*)\s*\{/g) || [])].map(c => c.replace(/\s*\{/, ''));
console.log('=== CSS 类总数:', cssClasses.length, '===');
console.log(cssClasses.join(', '));

// 2. 提取 HTML 里的主要结构标签
console.log('\n=== 主要区域 id ===');
const ids = [...new Set(html.match(/id="([\w-]+)"/g) || [])].map(i => i.replace(/id="/, '').replace(/"/, ''));
console.log(ids.join(', '));

// 3. 看主布局容器
console.log('\n=== 顶层结构 ===');
const topMatches = html.match(/<(header|nav|main|section|footer|aside)[^>]*>|<div class="(shell|grid|drawer[^"]*|command-deck)[^"]*"[^>]*>/g) || [];
console.log(topMatches.slice(0, 30).join('\n'));
