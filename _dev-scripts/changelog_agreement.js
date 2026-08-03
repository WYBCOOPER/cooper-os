// CHANGELOG 留痕：分工协议 v2
const fs = require('fs');
const p = 'C:/Users/wyb/Desktop/草哥工作台/CHANGELOG.md';
let c = fs.readFileSync(p, 'utf8');

const entry = `### 🤝 分工协议 v2（代码生成让渡）
- **代码生成正式让渡给 Reasonix**（联网研究：它写码更强）
- 老师保留：需求/设计/审核/安全/系统/发布/数据/多端
- 标准流程：需求 → 老师拆解 → Reasonix 生成 → 老师审核（8 条红线）→ 合入 → 测试 → 留痕
- 触发词：「写个 xx」「让 Reasonix 审查」→ 老师自动调它

### 📦 发布`;

if (!c.includes('代码生成让渡')) {
  c = c.replace('### 📦 发布', entry);
  fs.writeFileSync(p, c);
  console.log('✅ CHANGELOG 已留痕（分工协议 v2）');
} else {
  console.log('ℹ️ 已存在');
}
