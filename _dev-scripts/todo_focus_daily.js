// 记录：今日聚焦修复待封装（等今天结束统一处理）
const fs = require('fs');

// 1. 记入 COOPER OS 待办
const dataPath = 'C:/Users/wyb/Desktop/草哥工作台/cooper-os-data.json';
try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const todos = data.todos || [];
  const item = { text: '今日聚焦按日期修复完成，待今天结束统一打包 + push GitHub', done: false, tag: '开发', created: '2026-08-04' };
  if (!todos.some(t => (t.text || t) === item.text)) {
    todos.push(item);
    data.todos = todos;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('✅ 已写入 COOPER OS 待办');
  } else { console.log('ℹ️ 待办已存在'); }
} catch(e) { console.log('待办写入失败:', e.message); }

// 2. 记入记忆
const memPath = 'C:/Users/wyb/.openclaw/workspace/memory/2026-08-04.md';
const entry = `
## 今日聚焦按日期修复（05:12-05:17，待封装）
- **宝宝发现问题**：昨日完成的聚焦今天还显示完成 → 质疑联动机制是否有效
- **根因**：cg_focus 是永久数组，无按天重置逻辑（设计缺陷，非联动问题）
- **修复**：改为按日期分桶（cg_focus_daily.日期），saveFocus() 统一写入，6处调用替换
- **验证**：JS 语法通过，服务器重启，网页版同步
- **宝宝决定**：先记录，今天继续挑刺，**等今天结束再统一封装 exe + push GitHub**
- 明天待办：收集今天所有问题 → 统一打包 v10.3.1 → git commit + push
`;
fs.appendFileSync(memPath, entry);
console.log('✅ 已记入记忆');
