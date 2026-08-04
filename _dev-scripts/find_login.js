// 找登录接口参数
const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

// 找 login 相关所有行
const lines = s.split('\n');
lines.forEach((l, i) => {
  if (l.includes('login') || l.includes('password') || l.includes('pwd') || l.includes('req.method') || l.includes('body')) {
    console.log(i + ': ' + l.trim().slice(0, 110));
  }
});
