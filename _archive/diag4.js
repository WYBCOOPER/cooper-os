/* 诊断：检查所有板块是否渲染 */
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280, height: 820, backgroundColor: '#04070f',
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.webContents.on('console-message', (e, level, msg) => {
    if (level >= 2) console.log('[ERR]', msg.slice(0, 200));
  });
  win.loadURL('http://127.0.0.1:3000/');
  setTimeout(() => {
    win.webContents.executeJavaScript(`JSON.stringify({
      deckTime: !!document.getElementById('deck-time'),
      deckFocus: document.getElementById('deck-focus') ? document.getElementById('deck-focus').children.length : -1,
      water: document.getElementById('water-grid') ? document.getElementById('water-grid').children.length : -1,
      review: document.getElementById('review-area') ? document.getElementById('review-area').children.length : -1,
      apps: document.getElementById('apps-grid') ? document.getElementById('apps-grid').children.length : -1,
      todos: document.getElementById('todo-list') ? document.getElementById('todo-list').children.length : -1,
      progress: document.getElementById('progress-area') ? document.getElementById('progress-area').children.length : -1,
      timetable: document.getElementById('timetable') ? document.getElementById('timetable').innerHTML.length : -1,
      cards: document.querySelectorAll('.card').length
    })`).then(r => console.log('[PAGE]', r)).catch(e => console.log('[ERR]', e.message));
  }, 4000);
});
