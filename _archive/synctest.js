// 用 Electron 无头模式测试真实页面：模拟手机写入后，页面轮询是否能更新 DOM
// 方法：加载页面 → 模拟手机 POST /api/save 改 cg_todos → 等 6 秒 → 检查页面 DOM 是否显示新待办
const { app, BrowserWindow } = require('electron');
const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1200, height: 800, show: false });
  await win.loadURL('http://127.0.0.1:3000/');
  await new Promise(r => setTimeout(r, 3000));

  // 模拟手机写入：加一条唯一标记的待办
  const marker = 'SYNC_TEST_' + Date.now();
  const cur = await post('http://127.0.0.1:3000/api/load', {});
  const todos = (await fetch('http://127.0.0.1:3000/api/load').then(r => r.json())).cg_todos || [];
  todos.push({ t: marker, done: false, pri: '#4f8dff' });
  await post('http://127.0.0.1:3000/api/save', { key: 'cg_todos', value: todos });
  console.log('手机写入:', marker);

  // 等 7 秒（轮询 5 秒 + 余量）
  await new Promise(r => setTimeout(r, 7000));

  // 检查页面 DOM
  const domText = await win.webContents.executeJavaScript('document.body.textContent');
  const found = domText.includes(marker);
  console.log('电脑页面显示新待办:', found ? '✅ 同步成功' : '❌ 失败');

  // 清理
  const todos2 = (await fetch('http://127.0.0.1:3000/api/load').then(r => r.json())).cg_todos || [];
  await post('http://127.0.0.1:3000/api/save', { key: 'cg_todos', value: todos2.filter(t => !t.t.includes('SYNC_TEST_')) });
  console.log('已清理测试数据');
  app.exit(found ? 0 : 1);
});
