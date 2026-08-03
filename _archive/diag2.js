/* 测试：Electron 里 iframe 嵌入 Control UI */
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200, height: 800,
    backgroundColor: '#04070f',
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.webContents.on('console-message', (e, level, msg) => console.log('[renderer]', msg));
  win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <html><body style="margin:0;background:#000">
      <iframe src="http://127.0.0.1:18789/" style="width:100%;height:100vh;border:none"></iframe>
    </body></html>
  `));
  setTimeout(() => {
    win.webContents.executeJavaScript(`document.querySelector('iframe') ? 'iframe 存在' : '无'`)
      .then(r => console.log('[result]', r));
  }, 4000);
});
