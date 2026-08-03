// 测试 Reasonix 非交互模式
const { exec } = require('child_process');
const t0 = Date.now();

exec('reasonix -p --output-format text "用一句话说明什么是时间复杂度"', {
  shell: 'cmd.exe',
  cwd: 'C:/Users/wyb/Desktop/草哥工作台',
  timeout: 120000
}, (e, so, se) => {
  console.log('耗时:', ((Date.now() - t0) / 1000).toFixed(1) + 's');
  console.log('--- 输出 ---');
  console.log(so.trim().slice(0, 800) || '(空)');
  if (se) console.log('--- stderr ---', se.trim().slice(0, 300));
  if (e) console.log('exit:', e.code);
});
