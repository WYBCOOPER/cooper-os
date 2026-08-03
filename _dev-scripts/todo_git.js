// 把 git 管理 COOPER OS 记入待办
const fs = require('fs');

// 1. 记入 COOPER OS 数据（todos）
const dataPath = 'C:/Users/wyb/Desktop/草哥工作台/cooper-os-data.json';
try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const todos = data.todos || [];
  const item = { text: 'COOPER OS 建 Git 仓库（git init + 提交 + push GitHub）', done: false, tag: '开发', created: '2026-08-03' };
  if (!todos.some(t => (t.text || t) === item.text)) {
    todos.push(item);
    data.todos = todos;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('✅ 已写入 COOPER OS 待办');
  } else {
    console.log('ℹ️ 待办已存在');
  }
} catch (e) { console.log('数据文件写入失败:', e.message); }

// 2. 记入记忆
const memPath = 'C:/Users/wyb/.openclaw/workspace/memory/2026-08-03.md';
const entry = `
## 待办新增（02:32）
- **COOPER OS 建 Git 仓库**（git init + 首次提交 + push 到 GitHub WYBCOOPER）
- 背景：宝宝 GitHub 账号确认可用（my-homepage 仓库存在），COOPER OS 项目还未纳入版本管理
- 价值：防止项目文件乱改找不回；大学协作必备
`;
fs.appendFileSync(memPath, entry);
console.log('✅ 已记入记忆');
