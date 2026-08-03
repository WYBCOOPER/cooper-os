/* 测试：BrowserView 嵌入 Control UI（绕过 iframe CSP） */
const { app, BrowserWindow, BrowserView } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1400, height: 860,
    backgroundColor: '#04070f',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  // 左侧：总控台（占 60%）
  win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <html><body style="margin:0;background:#04070f;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh">
      <div style="text-align:center">
        <h2>COOPER OS</h2>
        <p>左侧 = 总控台主界面</p>
        <p style="color:#888">右侧 = 老师对话面板</p>
      </div>
    </body></html>
  `));
  // 右侧：Control UI 用 BrowserView 叠加
  const view = new BrowserView({
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.setBrowserView(view);
  const setBounds = () => {
    const [w, h] = win.getContentSize();
    view.setBounds({ x: Math.floor(w * 0.42), y: 0, width: Math.floor(w * 0.58), height: h });
  };
  win.on('resize', setBounds);
  win.on('ready-to-show', () => setTimeout(setBounds, 300));
  view.webContents.loadURL('http://127.0.0.1:18789/');
  view.webContents.on('console-message', (e, level, msg) => {
    if (msg.includes('auth') || msg.includes('token') || msg.includes('login')) console.log('[view]', msg.slice(0, 100));
  });
  setTimeout(() => {
    view.webContents.executeJavaScript('document.title + " | " + (document.body ? document.body.innerHTML.length : 0) + " chars"')
      .then(r => console.log('[view-content]', r))
      .catch(e => console.log('[view-err]', e.message));
  }, 6000);
});
