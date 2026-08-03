/* ================================================================
   Reasonix 联动桥 (rx.js) — 老师调用 Reasonix 的专用工具
   用法：
     node rx.js ask "问题"          → 快速问答（-p 模式）
     node rx.js code "任务描述"     → 生成/修改代码（run 模式）
     node rx.js review              → AI 审查当前 git 改动
   输出：文本结果 + 耗时
   ================================================================ */
const { exec } = require('child_process');
const path = require('path');

const CWD = path.join(__dirname, '..'); // 项目根目录
const args = process.argv.slice(2);
const mode = args[0] || 'ask';
const task = args.slice(1).join(' ');

if (!task && mode !== 'review') {
  console.log('用法: node rx.js [ask|code|review] "任务描述"');
  process.exit(1);
}

const commands = {
  ask: `reasonix -p --output-format text "${task.replace(/"/g, '\\"')}"`,
  code: `reasonix run --output-format text "${task.replace(/"/g, '\\"')}"`,
  review: 'reasonix review'
};

const cmd = commands[mode];
console.log('🤖 Reasonix 联动: [' + mode + '] ' + (task || '').slice(0, 60) + (task.length > 60 ? '…' : ''));
console.log('⏳ 工作中（可能需 1-3 分钟）...\n');

const t0 = Date.now();
exec(cmd, { shell: 'cmd.exe', cwd: CWD, timeout: 600000, maxBuffer: 10 * 1024 * 1024 }, (e, so, se) => {
  console.log('--- 输出 ---');
  console.log(so.trim() || '(无输出)');
  if (se) console.log('--- stderr ---\n' + se.trim().slice(0, 500));
  console.log('\n⏱ 耗时: ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  if (e && e.code !== 0) console.log('⚠️ exit: ' + e.code);
});
