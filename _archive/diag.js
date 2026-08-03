/* 诊断版 main — 抓取渲染错误 */
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280, height: 820,
    backgroundColor: '#04070f',
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.webContents.on('console-message', (e, level, msg) => {
    console.log('[renderer:' + level + ']', msg);
  });
  win.webContents.on('did-fail-load', (e, code, desc) => {
    console.log('[did-fail-load]', code, desc);
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  setTimeout(() => {
    win.webContents.executeJavaScript(`JSON.stringify({
      deckTime: !!document.getElementById('deck-time'),
      deckFocus: document.getElementById('deck-focus') ? document.getElementById('deck-focus').children.length : -1,
      drawers: document.querySelectorAll('.drawer').length,
      cards: document.querySelectorAll('.card').length,
      bodyLen: document.body.innerHTML.length
    })`).then(r => console.log('[page]', r)).catch(e => console.log('[page-err]', e.message));
  }, 3500);
});
