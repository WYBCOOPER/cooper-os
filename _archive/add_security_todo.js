// 把安全待办写入 COOPER OS 数据 + 记忆
const fs = require('fs');

// 1. 检查 COOPER OS 数据文件
const dataPath = 'C:/Users/wyb/Desktop/草哥工作台/cooper-os-data.json';
let todos = [];
try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  todos = data.todos || [];
  console.log('现有待办数:', todos.length);
} catch (e) {
  console.log('数据文件不存在或不可读，将新建:', e.message);
}

// 2. 追加安全待办（去重）
const newItems = [
  { text: 'COOPER OS 3001 加访问口令（同 WiFi 防窥）', tag: '安全' },
  { text: 'COOPER OS 正/负路径安全测试脚本', tag: '安全' }
];
let added = 0;
newItems.forEach(item => {
  if (!todos.some(t => (t.text || t) === item.text)) {
    todos.push({ text: item.text, done: false, tag: item.tag, created: '2026-08-02' });
    added++;
  }
});

// 3. 写回
try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  data.todos = todos;
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`✅ 已写入 ${added} 条新待办，总计 ${todos.length} 条`);
} catch (e) {
  console.log('写回失败（数据格式未知）:', e.message);
}

// 4. 记录到记忆
const memPath = 'C:/Users/wyb/.openclaw/workspace/memory/2026-08-02.md';
const entry = `
## 安全升级（22:51-23:00）宝宝要求向专业工程师靠拢
- 宝宝问：我的代码能否部署生产？有没有安全意识？→ 老师诚实评估 + 联网研究（OWASP Top 10 + 前端安全）
- 已建立 \`SECURITY.md\`（工作台项目）：三级检查清单（写码/发布/公网）
- 已把安全规矩写入 AGENTS.md（永久生效）：输入过滤/密钥不硬编码/正负路径测试/发布认证/公网 HTTPS
- 发现隐患：COOPER OS 3001 监听 0.0.0.0 无认证（同 WiFi 可访问数据）→ 待办加访问口令
- 待办：① 3001 访问口令 ② 正/负路径测试脚本
- 已具备：gateway 127.0.0.1 内网隔离 ✅ + 48 位 auth token ✅ + 微信/QQ 白名单 ✅
`;
fs.appendFileSync(memPath, entry);
console.log('✅ 记忆已记录');
