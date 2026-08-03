// 版本更新：10.2.6 → 10.3.0
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('旧版本:', pkg.version);
pkg.version = '10.3.0';
fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
console.log('✅ package.json → 10.3.0');

// 项目数据里的项目版本（如果存在）
const projPath = 'C:/Users/wyb/Desktop/草哥工作台/cooper-os-data.json';
try {
  const data = JSON.parse(fs.readFileSync(projPath, 'utf8'));
  if (data.projects && data.projects.length) {
    const coop = data.projects.find(p => p.name === 'COOPER OS');
    if (coop) {
      coop.version = '10.3.0';
      fs.writeFileSync(projPath, JSON.stringify(data, null, 2));
      console.log('✅ 项目数据 COOPER OS 版本 → 10.3.0');
    }
  }
} catch(e) { console.log('项目数据跳过:', e.message); }
