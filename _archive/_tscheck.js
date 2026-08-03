
/* ================================================================
   COOPER OS v9 — 大学版（今日指挥台 + 抽屉 + 夜间复盘）
================================================================ */
const IS_SERVER = location.protocol === 'http:' || location.protocol === 'https:';

const store = {
  get(k, d) {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      return v === null ? d : v;
    } catch { return d; }
  },
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
    // 记录本地保存时间（防止轮询覆盖刚保存的数据）
    try { localStorage.setItem('cg_saved_' + k, String(Date.now())); } catch {}
    if (IS_SERVER) {
      fetch('/api/save', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ key: k, value: v }) })
        .then(r => r.json())
        .then(d => { if (d && d.ok === false) throw new Error('save failed'); })
        .catch(() => {
          // 离线：存入离线队列（电脑关机/断网时）
          try {
            const q = JSON.parse(localStorage.getItem('cg_offline') || '[]');
            const idx = q.findIndex(x => x.k === k);
            const item = { k, v, ts: Date.now() };
            if (idx >= 0) q[idx] = item; else q.push(item);
            localStorage.setItem('cg_offline', JSON.stringify(q));
            const el = document.getElementById('sb-sync');
            if (el) { el.textContent = '📴 离线模式（' + q.length + ' 条待同步）'; el.style.color = 'var(--red)'; }
          } catch {}
        });
    }
  }
};

function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
const pad = x => String(x).padStart(2,'0');
function dateKey() { const n=new Date(); return `${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())}`; }
function dayNum() { const n=new Date(); const s=new Date(n.getFullYear(),0,0); return Math.floor((n-s)/86400000); }

/* ===== 同步 ===== */
(function initSync() {
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
  const el = document.getElementById('sb-sync');
  if (IS_SERVER) {
    el.textContent = '📱 手机同步已开启';
    el.style.color = 'var(--green)';
    applyServerData();
    setInterval(applyServerData, 5000); // 每 5 秒轮询服务器
  } else {
    el.textContent = '📱 手机同步已关闭';
    el.style.color = 'var(--text-faint)';
  }
  function applyServerData() {
    fetch('/api/load').then(r=>r.json()).then(data => {
      // 恢复连接：推送离线队列
      if (typeof syncOffline === 'function') syncOffline();
      let changed = false;
      Object.keys(data).forEach(k => {
        if (data[k] !== null && data[k] !== undefined) {
          try {
            // 🔒 时间戳保护：跳过"本地比服务器新"的键（防旧数据覆盖新打卡）
            const savedAt = parseInt(localStorage.getItem('cg_saved_' + k) || '0', 10);
            if (Date.now() - savedAt < 30000) return; // 本地 30 秒内保存过 → 以本地为准
            // 服务器侧时间戳（如果服务器有 updatedAt 且比本地新才覆盖）
            const serverTs = data['cg_ts_' + k] || 0;
            const localTs = parseInt(localStorage.getItem('cg_ts_' + k) || '0', 10);
            if (serverTs > 0 && localTs > serverTs) return; // 本地更新 → 不覆盖
            const cur = localStorage.getItem(k);
            const next = JSON.stringify(data[k]);
            if (cur !== next) { localStorage.setItem(k, next); changed = true; }
          } catch {}
        }
      });
      if (changed) {
        // 重新加载全局变量（内存同步 localStorage）
        try { todos = store.get('cg_todos', []); } catch(e) {}
        try { focus = store.get('cg_focus', []); } catch(e) {}
        try { ddls = store.get('cg_ddls', []); } catch(e) {}
        try { schedule = store.get('cg_schedule', []); } catch(e) {}
        try { courses = store.get('cg_courses_v2', []); } catch(e) {}
        try { water = store.get('cg_water', 0); } catch(e) {}
        try { sleepLog = store.get('cg_sleep', {}); } catch(e) {}
        try { meds = store.get('cg_meds', []); } catch(e) {}
        try { clubs = store.get('cg_clubs', []); } catch(e) {}
        try { splits = store.get('cg_splits', []); } catch(e) {}
        
        try { journalData = store.get('cg_journal', {}); } catch(e) {}
        try { appLaunchers = store.get('cg_apps_launch', []); } catch(e) {}
        try { track = store.get('cg_track', []); } catch(e) {}
        try { projects = store.get('cg_projects', []); } catch(e) {}
        try { workflows = store.get('cg_workflows', []); } catch(e) {}
        try { apps = store.get('cg_apps', []); } catch(e) {}
        // 静默刷新所有视图（不整页重载，避免打断）
        if (typeof refreshAll === 'function') refreshAll();
        else location.reload();
      }
    }).catch(()=>{});
  }
})();

/* ===== 时钟 ===== */
const week = ['日','一','二','三','四','五','六'];
function tickClock() {
  const n = new Date();
  const time = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  document.getElementById('deck-time').textContent = time;
  document.getElementById('sb-clock').textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}`;
  document.getElementById('deck-date').textContent = `${n.getFullYear()}.${pad(n.getMonth()+1)}.${pad(n.getDate())} 星期${week[n.getDay()]}`;
}
function timeToMin(t) { const [h,m] = t.split(':').map(Number); return h*60+m; }
/* 当前课提醒（courses 定义后安全调用） */
function updateNowClass() {
  try {
    const n = new Date();
    const nowMin = n.getHours()*60 + n.getMinutes();
    const today = n.getDay();
    const cur = (courses || []).find(c => c.day === today && courseShown(c) && nowMin >= timeToMin(c.start) && nowMin < timeToMin(c.end));
    const deckDate = document.getElementById('deck-date');
    const base = `${n.getFullYear()}.${pad(n.getMonth()+1)}.${pad(n.getDate())} 星期${week[n.getDay()]}`;
    deckDate.textContent = cur ? base + ` · 📖 现在：${cur.name}` : base;
    // 下一节课倒计时
    const nextBox = document.getElementById('deck-next');
    if (nextBox) {
      const todays = (courses || []).filter(c => c.day === today && courseShown(c) && timeToMin(c.start) > nowMin).sort((a,b) => timeToMin(a.start) - timeToMin(b.start));
      if (todays.length) {
        const nx = todays[0];
        const diff = timeToMin(nx.start) - nowMin;
        const hh = Math.floor(diff/60), mm = diff%60;
        nextBox.innerHTML = '⏰ 下一节：' + escapeHtml(nx.name) + ' ' + nx.start + '（还有 ' + (hh>0?hh+' 小时 ':'') + mm + ' 分）' + (nx.place ? ' @' + escapeHtml(nx.place) : '');
      } else {
        nextBox.innerHTML = '';
      }
    }
  } catch {}
}
setInterval(tickClock, 1000); tickClock();

/* ===== 抽屉切换 ===== */
function openDrawer(id, btn) {
  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.drawer-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('open');
  btn.classList.add('active');
}

/* ===== 自定义弹窗（替代 prompt） ===== */
let modalCallback = null;
function openModal(title, fields, cb) {
  document.getElementById('modal-title').textContent = title;
  const box = document.getElementById('modal-fields');
  box.innerHTML = '';
  fields.forEach(f => {
    const div = document.createElement('div');
    div.className = 'm-field';
    let input;
    if (f.type === 'multicheck') {
      // 多选下拉（复选框，借鉴 c-drop 单选，值用逗号分隔）
      const hid = document.createElement('input');
      hid.type = 'hidden';
      hid.id = 'modal-' + f.k;
      hid.value = (f.value || []).join(',');
      const wrap = document.createElement('div');
      wrap.className = 'c-drop';
      const btn = document.createElement('div');
      btn.className = 'c-drop-btn';
      btn.innerHTML = '<span class="c-drop-val"></span><span class="arrow">▼</span>';
      const menu = document.createElement('div');
      menu.className = 'c-drop-menu';
      menu.style.display = 'none';
      const selected = new Set((f.value || []));
      const updateVal = () => {
        hid.value = [...selected].join(',');
        const names = [...selected];
        btn.querySelector('.c-drop-val').textContent = names.length ? ('已选 ' + names.length + ' 项') : '（未选择）';
        btn.querySelector('.c-drop-val').style.color = names.length ? 'var(--text)' : 'var(--text-faint)';
      };
      f.options.forEach(o => {
        const opt = document.createElement('div');
        opt.className = 'c-drop-opt' + (selected.has(o) ? ' sel' : '');
        opt.innerHTML = '<span style="margin-right:8px">' + (selected.has(o) ? '☑' : '☐') + '</span>' + o;
        opt.onclick = () => {
          if (selected.has(o)) { selected.delete(o); opt.classList.remove('sel'); opt.firstChild.textContent = '☐'; }
          else { selected.add(o); opt.classList.add('sel'); opt.firstChild.textContent = '☑'; }
          updateVal();
        };
        menu.appendChild(opt);
      });
      btn.onclick = (ev) => {
        ev.stopPropagation();
        if (menu.style.display === 'none') {
          const r = btn.getBoundingClientRect();
          menu.style.left = Math.max(10, r.left) + 'px';
          menu.style.top = (r.bottom + 4) + 'px';
          const estH = Math.min(f.options.length * 34 + 8, 200);
          if (r.bottom + estH > window.innerHeight - 10) {
            menu.style.top = Math.max(10, r.top - estH - 4) + 'px';
          }
          menu.style.display = 'block';
        } else {
          menu.style.display = 'none';
        }
      };
      updateVal();
      wrap.appendChild(btn);
      wrap.appendChild(menu);
      div.innerHTML = `<label>${f.label}</label>`;
      div.appendChild(hid);
      div.appendChild(wrap);
      box.appendChild(div);
      const closeMenu = () => { menu.style.display = 'none'; };
      setTimeout(() => {
        document.addEventListener('click', closeMenu, { once: true });
        document.addEventListener('scroll', closeMenu, { passive: true, once: true });
      }, 0);
      return; // 多选字段已完整渲染
    }
    if (f.type === 'select') {
      // 自定义下拉（div 模拟，解决 Electron 原生 select 无法选择的问题）
      const hid = document.createElement('input');
      hid.type = 'hidden';
      hid.id = 'modal-' + f.k;
      hid.value = f.value || f.options[0] || '';
      const wrap = document.createElement('div');
      wrap.className = 'c-drop';
      const btn = document.createElement('div');
      btn.className = 'c-drop-btn';
      btn.innerHTML = '<span class="c-drop-val"></span><span class="arrow">▼</span>';
      const menu = document.createElement('div');
      menu.className = 'c-drop-menu';
      menu.style.display = 'none';
      f.options.forEach(o => {
        const opt = document.createElement('div');
        opt.className = 'c-drop-opt' + (o === hid.value ? ' sel' : '');
        opt.textContent = o;
        opt.onclick = () => {
          hid.value = o;
          btn.querySelector('.c-drop-val').textContent = o;
          menu.querySelectorAll('.c-drop-opt').forEach(x => x.classList.remove('sel'));
          opt.classList.add('sel');
          menu.style.display = 'none';
        };
        menu.appendChild(opt);
      });
      btn.onclick = (ev) => {
        ev.stopPropagation();
        if (menu.style.display === 'none') {
          // fixed 定位：相对按钮计算
          const r = btn.getBoundingClientRect();
          menu.style.left = Math.max(10, r.left) + 'px';
          menu.style.top = (r.bottom + 4) + 'px';
          // 防止超出底部
          const estH = Math.min(f.options.length * 34 + 8, 180);
          if (r.bottom + estH > window.innerHeight - 10) {
            menu.style.top = Math.max(10, r.top - estH - 4) + 'px';
          }
          menu.style.display = 'block';
        } else {
          menu.style.display = 'none';
        }
      };
      btn.querySelector('.c-drop-val').textContent = hid.value;
      wrap.appendChild(btn);
      wrap.appendChild(menu);
      div.innerHTML = `<label>${f.label}</label>`;
      div.appendChild(hid);
      div.appendChild(wrap);
      box.appendChild(div);
      // 点击其他地方或滚动时关闭菜单
      const closeMenu = () => { menu.style.display = 'none'; };
      setTimeout(() => {
        document.addEventListener('click', closeMenu, { once: true });
        document.addEventListener('scroll', closeMenu, { passive: true, once: true });
      }, 0);
      return; // 自定义字段已完整渲染
    } else if (f.type === 'multi') {
      input = document.createElement('select');
      input.multiple = true;
      input.style.height = Math.min(f.options.length * 28 + 6, 90) + 'px';
      input.style.padding = '6px';
      f.options.forEach(o => {
        const op = document.createElement('option');
        op.value = o; op.textContent = o;
        if (f.value && f.value.includes(o)) op.selected = true;
        input.appendChild(op);
      });
      // 多选提示
      const hint = document.createElement('div');
      hint.className = 'm-hint';
      hint.textContent = '按住 Ctrl 可多选';
      setTimeout(() => { const d = input.closest('.m-field'); if (d) d.appendChild(hint); }, 0);
    } else {
      input = document.createElement('input');
      input.type = f.type || 'text';
      input.placeholder = f.placeholder || '';
    }
    input.value = f.value || '';
    input.id = 'modal-' + f.k;
    div.innerHTML = `<label>${f.label}</label>`;
    div.appendChild(input);
    box.appendChild(div);
  });
  modalCallback = cb;
  document.getElementById('modal-overlay').classList.add('open');
  const first = box.querySelector('input, select');
  if (first) {
    // 仅打开时聚焦一次（不再重试/抢焦点，避免用户点击其他输入框时被拉回）
    setTimeout(() => {
      try { first.focus(); } catch(e) {}
    }, 100);
  }
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  modalCallback = null;
}
function modalOk() {
  if (!modalCallback) return;
  const values = {};
  document.querySelectorAll('#modal-fields .m-field').forEach(f => {
    const inp = f.querySelector('input, select');
    if (inp.multiple) {
      values[inp.id.replace('modal-', '')] = [...inp.selectedOptions].map(o => o.value);
    } else {
      values[inp.id.replace('modal-', '')] = inp.value;
    }
  });
  modalCallback(values);
  closeModal();
}
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target.id === 'modal-overlay') closeModal();
});

/* ===== 快速捕获（GTD 捕捉：智能分类） ===== */
function openCapture() {
  const projOpts = ['（不选项目）'].concat((typeof projects !== 'undefined' ? projects : []).map(p => p.name));
  openModal('快速捕获', [
    { k:'text', label:'记录想法/任务（智能分类）', placeholder:'例：英语作业截止 08-05 / 明天背单词 / 买数据线' },
    { k:'proj', label:'归到项目（选填）', type:'select', options: projOpts },
  ], v => {
    const text = (v.text || '').trim();
    if (!text) return;
    captureRoute(text, v.proj && v.proj !== '（不选项目）' ? v.proj : '');
  });
}
function captureRoute(text, proj) {
  // 规则1：含“截止/到期 + 日期” → DDL
  const ddlMatch = text.match(/(截止|到期|之前|deadline)[\s:]*(\d{1,2}[-/.月]\d{1,2}日?|\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/);
  if (ddlMatch) {
    let dateStr = ddlMatch[2].replace(/月/g,'-').replace(/日/g,'').replace(/[\/.]/g,'-');
    // 补全年份
    const parts = dateStr.split('-');
    if (parts.length === 2) { const y = new Date().getFullYear(); dateStr = y + '-' + parts[0] + '-' + parts[1]; }
    const name = text.replace(ddlMatch[0], '').trim() || '待办事项';
    ddls.push({ id: Date.now(), name, end: dateStr });
    store.set('cg_ddls', ddls);
    renderDDL(); renderDDLList();
    alert('📌 已加入 DDL：' + name + '（' + dateStr + ' 截止）');
    return;
  }
  // 规则2：含“明天/今天/今晚” → 聚焦（最多3件）
  if (/(明天|今天|今晚|明日|上午|下午)/.test(text)) {
    if (focus.length >= 3) {
      todos.unshift({ t: text, done: false, pri: '#d4af6a' });
      store.set('cg_todos', todos); renderTodos();
      alert('📝 聚焦已满 3 件，已放入待办');
    } else {
      focus.push({ t: text, done: false });
      store.set('cg_focus', focus); renderFocus();
      alert('🎯 已加入今日聚焦');
    }
    return;
  }
  // 规则3：其他 → 待办
  const tag = proj ? '📁' + proj + ' ' : '';
  todos.unshift({ t: tag + text, done: false, pri: '#d4af6a' });
  store.set('cg_todos', todos); renderTodos();
  alert('✅ 已加入待办' + (proj ? '（项目：' + proj + '）' : ''));
}
/* 快捷键：Ctrl+Space 打开快速捕获 */
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); openCapture(); }
});

/* ===== 今日聚焦 ===== */
let focus = store.get('cg_focus', [
  { t: '背 50 个英语单词', done: false },
  { t: 'Python 学习 1 小时', done: false },
  { t: '写一个 C 程序', done: false },
]);
function renderFocus() {
  const box = document.getElementById('deck-focus'); box.innerHTML = '';
  focus.forEach((f,i) => {
    const item = document.createElement('div');
    item.className = 'deck-focus-item' + (f.done?' done':'');
    let bindName = '';
    try { if (f.bind && typeof track !== 'undefined' && track.length) bindName = (track.find(x=>x.key===f.bind)||{}).name || ''; } catch(e) {}
    item.innerHTML = `<div class="num">${i+1}</div><div class="txt">${escapeHtml(f.t)}${bindName?'<span class="fx-bind">'+bindName+'</span>':''}</div><div class="ck" onclick="toggleFocus(${i})"></div><span class="fx-del" onclick="delFocus(${i})" title="删除">✕</span>`;
    box.appendChild(item);
  });
}
function toggleFocus(i) {
  focus[i].done=!focus[i].done;
  store.set('cg_focus',focus);
  // 🔗 勾选完成 → 绑定追踪 +step（防重复：每项每天一次）
  if (focus[i].done && focus[i].bind) {
    const d = track.find(x => x.key === focus[i].bind);
    if (d) {
      const today = dateKey();
      const linked = store.get('cg_focus_linked', {});
      linked[today] = linked[today] || {};
      if (!linked[today][i]) {
        linked[today][i] = true;
        store.set('cg_focus_linked', linked);
        const step = d.step || 1;
        d.cur = (d.cur || 0) + step;
        const tt = store.get('cg_track_today', {});
        tt[today] = tt[today] || {};
        tt[today][d.key] = (tt[today][d.key] || 0) + step;
        store.set('cg_track_today', tt);
        store.set('cg_track', track);
        if (typeof renderTrack === 'function') renderTrack();
      }
    }
  }
  renderFocus();
}
function delFocus(i) { focus.splice(i,1); store.set('cg_focus',focus); renderFocus(); }
function addFocus() {
  // 绑定追踪选项（从 track 生成）
  let bindOpts = [{ v:'', t:'— 不绑定 —' }];
  try { if (typeof track !== 'undefined' && track.length) bindOpts = bindOpts.concat(track.map(d => ({ v:d.key, t:d.name }))); } catch(e) {}
  openModal('今日聚焦', [
    { k:'t', label:'最重要的事', placeholder:'比如：写程序 / 背 30 词' },
    { k:'bind', label:'绑定学习追踪（勾选完成时自动打卡）', type:'select', options: bindOpts.map(o=>o.t) }
  ], v => {
    if (!v.t) return;
    if (focus.length >= 3) { alert('聚焦最多 3 件，先完成一件'); return; }
    // select 返回的是选项文本，映射回 key
    const opt = bindOpts.find(o => o.t === v.bind);
    focus.push({ t: v.t, done: false, bind: opt ? opt.v : '' });
    store.set('cg_focus', focus); renderFocus();
  });
}

/* ===== DDL ===== */
let ddls = store.get('cg_ddls', [
  { id: 1, name: '📁 大学入学准备（开学）', end: '2026-09-01' },
]);
function dueDdls() {
  const today = new Date(); today.setHours(0,0,0,0);
  return ddls.filter(d => {
    const end = new Date(d.end); end.setHours(0,0,0,0);
    return end >= today;
  }).sort((a,b) => a.end.localeCompare(b.end));
}
function renderDDL() {
  const box = document.getElementById('deck-ddl'); box.innerHTML = '';
  const active = dueDdls().slice(0, 3);
  if (!active.length) {
    box.innerHTML = '<div class="ddl-empty">暂无 DDL 压力 ✌ 可以在学习区添加</div>';
    return;
  }
  const today = new Date(); today.setHours(0,0,0,0);
  active.forEach(d => {
    const end = new Date(d.end); end.setHours(0,0,0,0);
    const days = Math.round((end - today) / 86400000);
    const item = document.createElement('div');
    item.className = 'ddl-item' + (days <= 2 ? ' urgent':'');
    item.innerHTML = `<span class="ddl-name">${escapeHtml(d.name)}</span>
      <span style="font-family:var(--mono);font-size:11px;color:var(--text-dim)">${d.end}</span>
      <span class="ddl-left">${days === 0 ? '今天截止!' : days + ' 天'}</span>`;
    box.appendChild(item);
  });
}
renderDDL();

/* ===== 课程表（传统节次：行=节次，列=星期，支持单双周） ===== */
// 显示顺序：周一到周日（day 存储值 1-6=周一至周六, 0=周日）
const WEEK_CN = { 0:'日', 1:'一', 2:'二', 3:'三', 4:'四', 5:'五', 6:'六' };
const DISPLAY_DAYS = [1, 2, 3, 4, 5, 6, 0]; // 周一到周日
const PERIODS = [
  { n: '第1节', start: '08:00', end: '08:45' },
  { n: '第2节', start: '08:50', end: '09:35' },
  { n: '第3节', start: '09:55', end: '10:40' },
  { n: '第4节', start: '10:45', end: '11:30' },
  { n: '第5节', start: '11:35', end: '12:20' },
  { n: '第6节', start: '13:30', end: '14:15' },
  { n: '第7节', start: '14:20', end: '15:05' },
  { n: '第8节', start: '15:25', end: '16:10' },
  { n: '第9节', start: '16:15', end: '17:00' },
  { n: '第10节', start: '18:30', end: '19:15' },
  { n: '第11节', start: '19:20', end: '20:05' },
  { n: '第12节', start: '20:10', end: '20:55' },
];
// 当前是第几周（以 2026-09-01 开学为第 1 周，单双周判断）
const SEM_START = new Date('2026-09-01');
function currentWeek() {
  const now = new Date();
  const diff = Math.floor((now - SEM_START) / 86400000);
  const w = Math.floor(diff / 7) + 1;
  return w >= 1 ? w : 1;
}
function isOddWeek() { return currentWeek() % 2 === 1; }
function courseShown(c) {
  if (c.week === 'odd') return isOddWeek();
  if (c.week === 'even') return !isOddWeek();
  return true; // all
}
let courses = store.get('cg_courses_v2', [
  { name: '深度学习', day: 1, start: '08:00', end: '08:45', place: '1教1A5 04多', week: 'all' },
  { name: '计算机图形学', day: 1, start: '13:30', end: '14:15', place: '1教1A2 10多', week: 'all' },
  { name: '习近平新时代中国特色社会主义思想', day: 4, start: '13:30', end: '14:15', place: '', week: 'all' },
]);
function periodIndex(start) {
  const idx = PERIODS.findIndex(p => p.start === start);
  return idx >= 0 ? idx : 0;
}
function renderTimetable() {
  const box = document.getElementById('timetable');
  const now = new Date();
  const today = now.getDay();
  const nowMin = now.getHours()*60 + now.getMinutes();
  const wn = document.getElementById('week-num');
  if (wn) wn.textContent = currentWeek() + (isOddWeek() ? ' (单周)' : ' (双周)');
  let html = '<div class="tt-scroll"><table class="tt-table"><thead><tr><th></th>';
  DISPLAY_DAYS.forEach(d => { html += `<th class="${d===today?'today':''}">周${WEEK_CN[d]}</th>`; });
  html += '</tr></thead><tbody>';
  PERIODS.forEach((p, pi) => {
    html += `<tr><td class="tt-period">${p.n}<br><span style="font-size:8px">${p.start}</span></td>`;
    for (const day of DISPLAY_DAYS) {
      const dayCourses = courses.filter(c => c.day === day && periodIndex(c.start) === pi && courseShown(c));
      if (!dayCourses.length) {
        html += `<td><div class="tt-cell" onclick="addCourseAt(${day}, '${p.start}')"></div></td>`;
        continue;
      }
      let cellHtml = `<td><div class="tt-cell" onclick="addCourseAt(${day}, '${p.start}')">`;
      dayCourses.forEach(c => {
        const idx = courses.indexOf(c);
        const [h,m] = c.start.split(':').map(Number);
        const [he,me] = c.end.split(':').map(Number);
        const isNow = day === today && nowMin >= h*60+m && nowMin < he*60+me;
        const weekTag = c.week === 'odd' ? '单' : c.week === 'even' ? '双' : '';
        cellHtml += `<div class="${isNow?'tt-cell now':''}" style="padding:3px 0">
          <span class="tt-del" onclick="event.stopPropagation();delCourse(${idx})">✕</span>
          <div class="tt-name">${escapeHtml(c.name)}${weekTag?' <span style="font-size:8px;color:var(--warn)">['+weekTag+']</span>':''}</div>
          <div class="tt-time">${c.start}${c.place?' · '+escapeHtml(c.place):''}</div>
        </div>`;
      });
      cellHtml += '</div></td>';
      html += cellHtml;
    }
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  box.innerHTML = html;
}
function addCourseAt(day, start) {
  openModal('添加课程', [
    { k:'name', label:'课程名称', placeholder:'高等数学' },
    { k:'day', label:'星期', type:'select', options:['周一','周二','周三','周四','周五','周六','周日'], value: '周' + WEEK_CN[day] },
    { k:'start', label:'开始时间', type:'select', options: PERIODS.map(p=>p.start), value: start },
    { k:'end', label:'结束时间', type:'select', options: PERIODS.map(p=>p.end), value: PERIODS[periodIndex(start)].end },
    { k:'week', label:'单双周', type:'select', options:['每周','单周','双周'], value:'每周' },
    { k:'place', label:'地点（可空）', placeholder:'A101' },
  ], v => {
    if (!v.name) return;
    const wm = { '每周':'all', '单周':'odd', '双周':'even' };
    courses.push({ name: v.name, day: dayMap2[v.day.replace('周','')], start: v.start, end: v.end, week: wm[v.week] || 'all', place: v.place });
    store.set('cg_courses_v2', courses); renderTimetable();
  });
}
function addCourse() { addCourseAt(1, '08:00'); }
function delCourse(i) { courses.splice(i,1); store.set('cg_courses_v2', courses); renderTimetable(); }
renderTimetable();
setInterval(updateNowClass, 30000);
updateNowClass();

/* ===== 课表一键导入（教务系统文本 → 课程） ===== */
function showImportModal() {
  openModal('粘贴导入课表', [
    { k:'text', label:'粘贴教务课表内容（每行：星期 时间 课程名 地点，或按你课表的文本格式）', placeholder:'示例：\n周一 09:14 深度学习 1教1A5 04多\n周一 13:30 计算机图形学 1教1A2 10多' },
  ], v => {
    if (!v.text || !v.text.trim()) return;
    const lines = v.text.split('\n').map(s => s.trim()).filter(Boolean);
    let added = 0;
    lines.forEach(line => {
      const c = parseCourseLine(line);
      if (c) { courses.push(c); added++; }
    });
    if (added) {
      store.set('cg_courses_v2', courses);
      renderTimetable();
      alert('✅ 成功导入 ' + added + ' 门课程（可手动调整）');
    } else {
      alert('⚠️ 没解析出课程。格式：星期 时间 课程名 地点\n例如：周一 09:14 深度学习 1教1A5 04多');
    }
  });
}
const dayMap2 = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'日':0,'天':0 };
function parseCourseLine(line) {
  // 匹配：周X 或 星期X 开头，后面跟时间 HH:MM，然后是 课程名 地点
  const m = line.match(/^(周|星期)([一二三四五六日天])[\s\s]*?([0-2]\d:[0-5]\d)\s+(.+)$/);
  if (!m) return null;
  const dayMap = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'日':0,'天':0 };
  const day = dayMap[m[2]];
  const time = m[3];
  // 第一个空格前=课程名，后面=地点
  const rest = m[4].trim();
  const sp = rest.indexOf(' ');
  let name, place = '';
  if (sp > 0) { name = rest.slice(0, sp).trim(); place = rest.slice(sp+1).trim(); }
  else name = rest;
  if (!name) return null;
  // 找对应节次
  const pi = PERIODS.findIndex(p => p.start === time);
  const end = pi >= 0 ? PERIODS[pi].end : time;
  return { name, day, start: time, end, place, week: 'all' };
}

/* ===== DDL 管理 ===== */
function renderDDLList() {
  const box = document.getElementById('ddl-list');
  const today = new Date(); today.setHours(0,0,0,0);
  const sorted = [...ddls].sort((a,b)=>a.end.localeCompare(b.end));
  document.getElementById('ddl-count').textContent = sorted.length + ' 个截止';
  if (!sorted.length) { box.innerHTML = '<div class="card-body">暂无 DDL</div>'; return; }
  box.innerHTML = '';
  // 联动：今天截止的 DDL 自动确保在待办里（带 🔔 标记）
  const todayStr = dateKey();
  sorted.forEach((d,i) => {
    const end = new Date(d.end); end.setHours(0,0,0,0);
    const days = Math.round((end - today)/86400000);
    if (days <= 0) {
      const exists = todos.some(t => t.t === '🔔 ' + d.name);
      if (!exists) { todos.unshift({ t: '🔔 ' + d.name + '（今天截止）', done: false, pri: '#ff7a94' }); store.set('cg_todos', todos); renderTodos(); }
    }
    const cls = days <= 3 ? 'urgent' : days <= 7 ? 'warn' : '';
    const item = document.createElement('div');
    item.className = 'ddl-item ' + cls;
    item.innerHTML = `<span class="dl-name">${escapeHtml(d.name)}</span>
      <span class="dl-date">${d.end}</span>
      <span class="dl-left" style="color:${days<=3?'var(--red)':days<=7?'var(--yellow)':'var(--green)'}">${days<=0?'已到期':days+'天'}</span>
      <span class="dl-del" onclick="delDDL(${d.id})">✕</span>`;
    box.appendChild(item);
  });
}
function addDDL() {
  const name = document.getElementById('ddl-name').value.trim();
  const date = document.getElementById('ddl-date').value;
  if (!name || !date) { alert('填事项和日期'); return; }
  ddls.push({ id: Date.now(), name, end: date });
  document.getElementById('ddl-name').value='';
  store.set('cg_ddls', ddls); renderDDL(); renderDDLList();
}
function delDDL(id) { ddls = ddls.filter(d => d.id !== id); store.set('cg_ddls', ddls); renderDDL(); renderDDLList(); }
renderDDLList();

/* ===== 社团 ===== */
let clubs = store.get('cg_clubs', [
  { name: '羽毛球社', day: 2, time: '19:00', place: '体育馆' },
  { name: '编程协会', day: 6, time: '14:00', place: '机房A' },
]);
function renderClubs() {
  const box = document.getElementById('club-list'); box.innerHTML = '';
  if (!clubs.length) { box.innerHTML = '<div class="card-body">暂无社团活动</div>'; return; }
  clubs.forEach((c,i) => {
    const item = document.createElement('div');
    item.className = 'club-item';
    item.innerHTML = `<span class="c-name">${escapeHtml(c.name)}</span>
      <span class="c-info">周${WEEK_CN[c.day]} ${c.time}${c.place?' · '+escapeHtml(c.place):''}</span>
      <span class="c-del" onclick="delClub(${i})">✕</span>`;
    box.appendChild(item);
  });
}
function addClub() {
  const name = document.getElementById('club-name').value.trim();
  const day = parseInt(document.getElementById('club-day').value);
  const time = document.getElementById('club-time').value.trim();
  const place = document.getElementById('club-place').value.trim();
  if (!name) { alert('填社团名称'); return; }
  clubs.push({ name, day, time: time||'19:00', place });
  document.getElementById('club-name').value='';
  document.getElementById('club-time').value='';
  document.getElementById('club-place').value='';
  store.set('cg_clubs', clubs); renderClubs();
}
function delClub(i) { clubs.splice(i,1); store.set('cg_clubs', clubs); renderClubs(); }
renderClubs();

/* ===== 番茄钟 ===== */
/* ===== 间隔复习（重新设计：出题→答案→标记） ===== */
const KNOWLEDGE = [
  { cat:'PROGRAMMING', q:'Bug 这个词是怎么来的？', a:'Bug 原意"小虫子"。1947 年工程师在 Mark II 计算机继电器里发现飞蛾导致故障，从此 debug（除虫）= 修 bug。' },
  { cat:'ENGLISH', q:'Deploy 是什么意思？造个句。', a:'Deploy = 部署（把代码发布到服务器）。例句：We deploy the app every Friday.' },
  { cat:'PROGRAMMING', q:'为什么数组下标从 0 开始？', a:'下标表示"偏移量"——第一个元素偏移 0。这样内存地址计算更高效，C 语言流传下来的惯例。' },
  { cat:'ENGLISH', q:'Compile 是什么意思？', a:'Compile = 编译（源码→机器码）。例句：The C code compiles without errors.' },
  { cat:'PROGRAMMING', q:'堆和栈有什么区别？', a:'栈：系统自动管理，放局部变量，快但小。堆：程序员手动申请释放（malloc），大但慢。' },
  { cat:'ENGLISH', q:'Debug 是什么意思？', a:'Debug = 调试/除虫。例句：I spent two hours debugging this function.' },
  { cat:'PROGRAMMING', q:'指针是什么？', a:'指针是存"内存地址"的变量，指向某个位置。C 语言的核心概念。' },
  { cat:'ENGLISH', q:'Commit 是什么意思？', a:'Commit = 提交（Git 保存变更）。例句：Commit your changes before pushing.' },
  { cat:'PROGRAMMING', q:'编译型和解释型语言的区别？', a:'编译型（C/C++）：整体翻译再运行，快。解释型（Python）：边翻译边运行，灵活但慢。' },
  { cat:'ENGLISH', q:'Refactor 是什么意思？', a:'Refactor = 重构（不改功能优化代码）。例句：We should refactor this function.' },
  { cat:'PROGRAMMING', q:'为什么计算机只用 0 和 1？', a:'晶体管两种状态：通电=1，断电=0。所有数据底层都是 0/1。' },
  { cat:'ENGLISH', q:'Server 是什么意思？', a:'Server = 服务器（24 小时提供服务）。例句：The server crashed last night.' },
];
/* ===== 学习进度（当前值+目标都可改） ===== */
const MILESTONES = [
  { d:'2026-07-16', t:'健身入门', x:'首次进健身房' },
  { d:'2026-07-22', t:'高考录取', x:'江南大学 计算机科学与技术' },
  { d:'2026-07-25', t:'身份认证', x:'办身份证、激活银行卡' },
  { d:'2026-07-26', t:'GitHub 注册', x:'账号已创建' },
  { d:'2026-07-30', t:'Linux/Docker 入门', x:'WSL2、Docker 概念' },
  { d:'2026-07-30', t:'命令行入门', x:'三端命令速查手册' },
  { d:'2026-07-30', t:'前端项目部署', x:'JobCloud 全流程' },
  { d:'2026-07-31', t:'总控台 v8', x:'COOPER OS 三端交付' },
  { d:'2026-08-01', t:'总控台 v9', x:'大学版：指挥台+抽屉+复盘' },
];

/* ===== 待办 ===== */
let todos = store.get('cg_todos', [
  { t: '背 50 个英语单词', done: false, pri: '#ffc857' },
  { t: 'Python 学习 1 小时', done: false, pri: '#d4af6a' },
  { t: '写一个 C 程序', done: false, pri: '#4fe3c1' },
]);
function renderTodos() {
  const ul = document.getElementById('todo-list'); ul.innerHTML = '';
  const undone = todos.filter(x=>!x.done).length;
  document.getElementById('todo-count').textContent = undone + ' 未完成';
  todos.forEach((x,i) => {
    const li = document.createElement('li');
    li.className = x.done?'done':'';
    li.innerHTML = `<span class="cb" onclick="toggleTodo(${i})"></span><span class="pri" style="background:${x.pri}"></span><span class="t-text">${escapeHtml(x.t)}</span><span class="del" onclick="delTodo(${i})">✕</span>`;
    ul.appendChild(li);
  });
}
function addTodo() {
  const inp = document.getElementById('todo-text');
  const v = inp.value.trim(); if (!v) return;
  todos.unshift({ t:v, done:false, pri:'#d4af6a' });
  inp.value=''; store.set('cg_todos',todos); renderTodos();
}
function toggleTodo(i) { todos[i].done=!todos[i].done; store.set('cg_todos',todos); renderTodos(); }
function delTodo(i) { todos.splice(i,1); store.set('cg_todos',todos); renderTodos(); }
renderTodos();

/* ===== 日程 ===== */
let schedule = store.get('cg_schedule', [
  { t:'09:00', x:'背英语单词' }, { t:'14:00', x:'Python 学习' }, { t:'19:00', x:'羽毛球课' },
]);
function renderSchedule() {
  const tl = document.getElementById('timeline'); tl.innerHTML = '';
  const now = new Date(); const nowMin = now.getHours()*60 + now.getMinutes();
  [...schedule].sort((a,b)=>a.t.localeCompare(b.t)).forEach((s,i) => {
    const [h,m] = s.t.split(':').map(Number);
    const item = document.createElement('div');
    item.className = 'tl-item' + (h*60+m<=nowMin && nowMin<h*60+m+120 ? ' now':'');
    item.innerHTML = `<div class="tl-time">${s.t}</div><div class="tl-text">${escapeHtml(s.x)}<span class="del" onclick="delSchedule(${i})">✕</span></div>`;
    tl.appendChild(item);
  });
}
function addSchedule() {
  const t = document.getElementById('tl-time').value;
  const x = document.getElementById('tl-text').value.trim(); if (!x) return;
  schedule.push({ t, x }); document.getElementById('tl-text').value='';
  store.set('cg_schedule', schedule); renderSchedule();
}
function delSchedule(i) { schedule.splice(i,1); store.set('cg_schedule', schedule); renderSchedule(); }
renderSchedule();

/* ===== 软件管理 ===== */
let appLaunchers = store.get('cg_apps_launch', [
  { name: 'VS Code', icon: '⌘', path: 'C:\\Users\\wyb\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', cat: '开发' },
  { name: 'Obsidian', icon: '✶', path: 'C:\\Users\\wyb\\AppData\\Local\\Obsidian\\Obsidian.exe', cat: '学习' },
  { name: 'Ubuntu', icon: '▣', path: 'C:\\Windows\\System32\\wsl.exe', cat: '开发' },
  { name: 'Chrome', icon: '🌐', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', cat: '常用' },
  { name: '微信', icon: '💬', path: 'C:\\Program Files (x86)\\Tencent\\WeChat\\WeChat.exe' },
]);
/* 应用分类推断（兼容无 cat 的旧数据） */
function appCat(name) {
  const n = name.toLowerCase();
  const rules = [
    ['开发', ['code','vscode','visual','wsl','ubuntu','git','node','python','docker','terminal','msys','powershell','cmd','clang']],
    ['学习', ['obsidian','bilibili','哔哩','扇贝','word','excel','ppt','onenote','词典','wps','笔记']],
    ['办公', ['chrome','edge','浏览器','百度网盘','everything','文件夹','explorer','office','wps']],
    ['通讯', ['微信','qq','wechat']],
  ];
  for (const [cat, kws] of rules) {
    if (kws.some(k => n.includes(k))) return cat;
  }
  return '其他';
}
let appCatNow = '常用';
const APP_CATS = ['常用','开发','学习','办公','通讯','其他'];
function renderAppLaunchers() {
  const box = document.getElementById('apps-launcher');
  box.innerHTML = '';
  // 分类标签栏
  const tabs = document.createElement('div');
  tabs.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px';
  APP_CATS.forEach(cat => {
    const tab = document.createElement('button');
    tab.className = 'mini-btn' + (cat === appCatNow ? '' : ' ghost');
    tab.style.cssText = 'font-size:10px;padding:5px 10px';
    tab.textContent = cat;
    tab.onclick = () => { appCatNow = cat; renderAppLaunchers(); };
    tabs.appendChild(tab);
  });
  box.appendChild(tabs);
  // 当前分类的应用
  const shown = appLaunchers.filter(a => appCatNow === '常用' ? true : (appCat(a.name) === appCatNow));
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
  shown.forEach((a,i) => {
    const item = document.createElement('div');
    item.className = 'launcher';
    item.innerHTML = `<span style="font-size:16px">${a.icon}</span>${escapeHtml(a.name)}<span style="color:var(--text-faint);cursor:pointer;font-size:11px" onclick="event.stopPropagation();delAppLauncher(${i})">✕</span>`;
    item.onclick = () => launchApp(i);
    item.title = a.path;
    row.appendChild(item);
  });
  const add = document.createElement('div');
  add.className = 'launcher';
  add.style.cssText = 'border-style:dashed;color:var(--text-faint)';
  add.innerHTML = `<span style="font-size:16px">＋</span>添加`;
  add.onclick = addAppLauncher;
  row.appendChild(add);
  const scan = document.createElement('div');
  scan.className = 'launcher';
  scan.style.cssText = 'border-style:dashed;color:var(--text-faint)';
  scan.innerHTML = `<span style="font-size:16px">🔍</span>扫描`;
  scan.onclick = scanApps;
  row.appendChild(scan);
  box.appendChild(row);
}
function scanApps() {
  if (!IS_SERVER) { alert('需通过 exe 使用'); return; }
  fetch('/api/apps/scan').then(r=>r.json()).then(d => {
    if (!d.ok || !d.apps.length) { alert('没扫描到软件'); return; }
    openModal('选择要添加的软件（输入序号，多个用空格）', [
      { k:'names', label: d.apps.map((a,i)=>(i+1)+'. '+a.name).join('\n'), placeholder:'如：1 3 5' },
    ], v => {
      const idxs = (v.names||'').split(/[\s,，]+/).map(Number).filter(n => n >= 1 && n <= d.apps.length);
      idxs.forEach(n => {
        const a = d.apps[n-1];
        if (a && !appLaunchers.find(x => x.name === a.name)) {
          appLaunchers.push({ name: a.name, icon: a.icon || '🔗', path: a.path });
        }
      });
      store.set('cg_apps_launch', appLaunchers);
      renderAppLaunchers();
      alert('✅ 已添加 ' + idxs.length + ' 个软件');
    });
  }).catch(()=>alert('扫描失败'));
}
function addAppLauncher() {
  openModal('添加软件', [
    { k:'name', label:'名称', placeholder:'VS Code' },
    { k:'icon', label:'图标 (emoji)', placeholder:'⌘' },
    { k:'path', label:'exe 完整路径', placeholder:'C:\\Program Files\\xxx\\app.exe' },
  ], v => {
    if (!v.name || !v.path) { alert('填名称和路径'); return; }
    appLaunchers.push({ name: v.name, icon: v.icon || '🔗', path: v.path });
    store.set('cg_apps_launch', appLaunchers); renderAppLaunchers();
  });
}
function delAppLauncher(i) { appLaunchers.splice(i,1); store.set('cg_apps_launch', appLaunchers); renderAppLaunchers(); }
function launchApp(i) {
  const a = appLaunchers[i];
  if (IS_SERVER) fetch('/api/apps/launch?path=' + encodeURIComponent(a.path)).catch(()=>{});
  else alert('需通过 exe 使用');
}
renderAppLaunchers();

/* ===== 一键工作流 ===== */
let workflows = store.get('cg_workflows', [
  { name: '学习模式', icon: '📚', apps: ['VS Code', 'Obsidian', 'Ubuntu'] },
  { name: '写代码', icon: '💻', apps: ['VS Code', 'Chrome'] },
]);
function renderWorkflows() {
  const box = document.getElementById('workflows');
  box.innerHTML = '';
  if (!workflows.length) { box.innerHTML = '<div class="card-body">还没有工作流</div>'; return; }
  workflows.forEach((w,i) => {
    const item = document.createElement('div');
    item.className = 'launcher';
    item.style.cssText = 'flex:1;min-width:150px;justify-content:space-between';
    const appNames = w.apps.map(n => {
      const found = appLaunchers.find(a => a.name === n);
      return found ? found.name : n;
    }).join(' + ');
    item.innerHTML = `<span><span style="font-size:16px">${w.icon}</span> ${escapeHtml(w.name)}</span>
      <span style="font-size:10px;color:var(--text-faint)">${escapeHtml(appNames)}</span>
      <span style="color:var(--text-faint);cursor:pointer;font-size:11px" onclick="event.stopPropagation();editWorkflow(${i})">✏️</span>
      <span style="color:var(--text-faint);cursor:pointer;font-size:11px" onclick="event.stopPropagation();delWorkflow(${i})">✕</span>`;
    item.onclick = () => runWorkflow(i);
    box.appendChild(item);
  });
}
function addWorkflow() {
  openModal('新建工作流', [
    { k:'name', label:'名称', placeholder:'学习模式' },
    { k:'icon', label:'图标', placeholder:'📚' },
    { k:'apps', label:'启动哪些软件（用 + 分隔，需先添加好软件）', placeholder:'VS Code + Obsidian + Ubuntu' },
  ], v => {
    if (!v.name || !v.apps) return;
    const apps = v.apps.split('+').map(s=>s.trim()).filter(Boolean);
    workflows.push({ name: v.name, icon: v.icon || '⚡', apps });
    store.set('cg_workflows', workflows); renderWorkflows();
  });
}

function editWorkflow(i) {
  const w = workflows[i];
  openModal('编辑工作流', [
    { k:'name', label:'名称', placeholder:w.name },
    { k:'icon', label:'图标', placeholder:w.icon },
    { k:'apps', label:'启动哪些软件（用 + 分隔）', placeholder:w.apps.join(' + ') },
  ], v => {
    if (!v.name || !v.apps) return;
    w.name = v.name.trim();
    w.icon = v.icon || w.icon;
    w.apps = v.apps.split('+').map(s=>s.trim()).filter(Boolean);
    store.set('cg_workflows', workflows); renderWorkflows();
  });
}
function delWorkflow(i) { workflows.splice(i,1); store.set('cg_workflows', workflows); renderWorkflows(); }
function runWorkflow(i) {
  const w = workflows[i];
  let count = 0;
  w.apps.forEach(name => {
    const found = appLaunchers.find(a => a.name === name);
    if (found && IS_SERVER) {
      fetch('/api/apps/launch?path=' + encodeURIComponent(found.path)).catch(()=>{});
      count++;
    }
  });
  // 非阻塞提示（不用 alert，避免抢焦点导致 modal 输入失效）
  const el = document.getElementById('sb-sync');
  if (el) {
    el.textContent = '⚡ ' + w.name + '：已启动 ' + count + ' 个软件';
    el.style.color = 'var(--green)';
    setTimeout(() => { try { el.textContent = '📱 手机同步已开启'; el.style.color = 'var(--green)'; } catch(e) {} }, 3000);
  }
}
renderWorkflows();

/* ===== 启动器（旧版保留兼容） ===== */
function launch(app) {
  if (IS_SERVER) fetch('/api/launch/' + app).catch(()=>{});
  else alert('需通过 exe 使用');
}

/* ===== 文档中心（最近文档） ===== */
let docFilesCache = [];
async function renderDocs(kw) {
  const box = document.getElementById('doc-list');
  const q = (kw || '').trim().toLowerCase();
  try {
    if (!docFilesCache.length) {
      const r = await fetch('/api/docs/recent');
      const d = await r.json();
      if (!d.ok || !d.files.length) {
        box.innerHTML = '<div class="doc-empty">没找到文档。把文件放桌面/文档/下载文件夹即可。</div>';
        return;
      }
      docFilesCache = d.files;
    }
    const files = q ? docFilesCache.filter(f => f.name.toLowerCase().includes(q)) : docFilesCache;
    if (!files.length) {
      box.innerHTML = '<div class="doc-empty">没有匹配的文档</div>';
      return;
    }
    box.innerHTML = '';
    files.forEach(f => {
      const icon = f.ext==='docx'||f.ext==='doc' ? '📘' : f.ext==='xlsx'||f.ext==='xls' ? '📗' : f.ext==='pptx'||f.ext==='ppt' ? '📙' : f.ext==='pdf' ? '📕' : f.ext==='md' ? '📝' : '📄';
      const item = document.createElement('div');
      item.className = 'doc-item';
      const mtime = new Date(f.mtime);
      item.innerHTML = `<span class="d-ic">${icon}</span>
        <span class="d-name">${escapeHtml(f.name)}</span>
        <span class="d-size">${(f.size/1024).toFixed(0)}KB · ${mtime.getMonth()+1}/${mtime.getDate()}</span>`;
      item.onclick = () => fetch('/api/docs/open-file?path=' + encodeURIComponent(f.path)).catch(()=>{});
      box.appendChild(item);
    });
  } catch {
    box.innerHTML = '<div class="doc-empty">需通过 exe 使用文档中心</div>';
  }
}
renderDocs();

/* ===== 常用链接（可增删） ===== */
let apps = store.get('cg_apps', [
  { name:'DeepSeek', icon:'🧠', url:'https://chat.deepseek.com', tag:'AI' },
  { name:'Kimi', icon:'🌙', url:'https://kimi.moonshot.cn', tag:'AI' },
  { name:'GitHub', icon:'🐙', url:'https://github.com', tag:'CODE' },
  { name:'Bilibili', icon:'📺', url:'https://www.bilibili.com', tag:'MEDIA' },
  { name:'Stack Overflow', icon:'🔧', url:'https://stackoverflow.com', tag:'CODE' },
  { name:'W3School', icon:'🌐', url:'https://www.w3schools.com', tag:'DOC' },
  { name:'DeepL', icon:'🌍', url:'https://www.deepl.com', tag:'DOC' },
  { name:'微信', icon:'💬', url:'weixin://', tag:'SOCIAL' },
]);
function renderApps() {
  const grid = document.getElementById('apps-grid'); grid.innerHTML = '';
  apps.forEach((a,i) => {
    const item = document.createElement('div');
    item.className = 'app-item';
    item.innerHTML = `<span class="a-del" title="删除" onclick="delApp(${i})">✕</span>
      <div class="ai">${a.icon}</div><div class="an">${escapeHtml(a.name)}</div><div class="at">${escapeHtml(a.tag)}</div>`;
    item.onclick = () => openAppUrl(a.url);
    grid.appendChild(item);
  });
  const add = document.createElement('div');
  add.className = 'app-add';
  add.innerHTML = `<span class="plus">＋</span> 添加链接`;
  add.onclick = addApp;
  grid.appendChild(add);
}
function openAppUrl(url) {
  if (IS_SERVER && /^https?:\/\//i.test(url)) {
    fetch('/api/open-url?url=' + encodeURIComponent(url)).catch(()=>{});
  } else {
    window.open(url, '_blank');
  }
}
function delApp(i) { apps.splice(i,1); store.set('cg_apps', apps); renderApps(); }
function addApp() {
  openModal('添加链接', [
    { k:'name', label:'名称', placeholder:'DeepSeek' },
    { k:'url', label:'网址', placeholder:'https://…' },
    { k:'icon', label:'图标 (emoji)', placeholder:'🧠' },
    { k:'tag', label:'分类', placeholder:'AI' },
  ], v => {
    if (!v.name || !v.url) return;
    apps.push({ name: v.name, url: v.url, icon: v.icon || '🔗', tag: v.tag || 'APP' });
    store.set('cg_apps', apps); renderApps();
  });
}
renderApps();

/* ===== 文件传输 ===== */
function uploadFile() {
  const inp = document.getElementById('file-input');
  if (!inp.files || !inp.files.length) return;
  const file = inp.files[0];
  const st = document.getElementById('upload-status');
  st.textContent = '上传中…';
  const fd = new FormData();
  fd.append('file', file);
  fetch('/api/upload', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(d => {
      st.textContent = d.ok ? '✅ 已上传：' + d.name : '上传失败：' + (d.error||'');
      if (d.ok) { inp.value = ''; renderFiles(); }
    })
    .catch(() => { st.textContent = '上传失败（需通过 exe 使用）'; });
}
async function renderFiles() {
  const box = document.getElementById('file-list');
  try {
    const r = await fetch('/api/files');
    const d = await r.json();
    if (!d.ok || !d.files.length) {
      box.innerHTML = '<div class="doc-empty">inbox 文件夹为空。<br>手机/电脑传的文件都在这里。</div>';
      return;
    }
    box.innerHTML = '';
    d.files.forEach(f => {
      const item = document.createElement('div');
      item.className = 'doc-item';
      item.innerHTML = `<span class="d-ic">📄</span>
        <span class="d-name">${escapeHtml(f.name)}</span>
        <span class="d-size">${(f.size/1024).toFixed(1)}KB</span>
        <span class="a-del" onclick="delFile('${escapeHtml(f.name)}')" style="opacity:1;cursor:pointer;font-size:13px;color:var(--text-faint)">✕</span>`;
      // 点击下载
      item.onclick = () => {
        window.open('/api/files/download?name=' + encodeURIComponent(f.name));
      };
      box.appendChild(item);
    });
  } catch {
    box.innerHTML = '<div class="doc-empty">需通过 exe 使用文件传输</div>';
  }
}
function delFile(name) {
  if (!confirm('删除 ' + name + '？')) return;
  fetch('/api/files/delete?name=' + encodeURIComponent(name)).then(r=>r.json()).then(() => renderFiles()).catch(()=>{});
}
renderFiles();

/* ===== 数据图表 ===== */
/* ===== 成长 ===== */

function renderGrowth() {
  const grid = document.getElementById('growth-grid'); grid.innerHTML = '';
  [...MILESTONES].reverse().forEach(m => {
    const item = document.createElement('div');
    item.className = 'growth-item';
    item.innerHTML = `<div class="gi-date">✦ ${m.d}</div><div class="gi-title">${escapeHtml(m.t)}</div><div class="gi-desc">${escapeHtml(m.x)}</div>`;
    grid.appendChild(item);
  });
}
renderGrowth();

/* ===== 喝水 ===== */
let water = store.get('cg_water', {});
let waterToday = water[dateKey()] || 0;
function renderWater() {
  const grid = document.getElementById('water-grid'); grid.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const cup = document.createElement('div');
    cup.className = 'water-cup' + (i < waterToday ? ' drank':'');
    cup.textContent = i < waterToday ? '💧' : '';
    cup.onclick = () => toggleWater(i);
    grid.appendChild(cup);
  }
  document.getElementById('water-count').textContent = waterToday;
}
function toggleWater(i) {
  waterToday = (i+1 === waterToday) ? i : i+1;
  water[dateKey()] = waterToday;
  store.set('cg_water', water);
  renderWater();
}
renderWater();

/* ===== 作息 ===== */
let sleepLog = store.get('cg_sleep', {});
function saveSleep() {
  const bed = document.getElementById('sleep-bed').value;
  const wake = document.getElementById('sleep-wake').value;
  if (!bed || !wake) { alert('请选择睡觉和起床时间'); return; }
  const [bh,bm] = bed.split(':').map(Number);
  const [wh,wm] = wake.split(':').map(Number);
  let hours = (wh*60+wm - (bh*60+bm)) / 60;
  if (hours < 0) hours += 24;
  sleepLog[dateKey()] = { bed, wake, hours: Math.round(hours*10)/10 };
  store.set('cg_sleep', sleepLog);
  renderSleep();
  alert('已记录：' + bed + ' 睡 → ' + wake + ' 醒（' + Math.round(hours*10)/10 + ' 小时）');
}
function renderSleep() {
  const el = document.getElementById('sleep-last');
  const today = sleepLog[dateKey()];
  el.innerHTML = today ? `昨晚 ${today.bed} 睡 · ${today.wake} 醒 · <b>${today.hours}h</b>` : '今天还没记录睡眠';
}
function sleepStats() {
  const vals = Object.values(sleepLog).map(s=>s.hours).filter(h=>!isNaN(h));
  if (!vals.length) { alert('还没有睡眠数据'); return; }
  const avg = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
  alert(`睡眠统计（${vals.length} 天）\n平均 ${avg}h · 最短 ${Math.min(...vals)}h · 最长 ${Math.max(...vals)}h`);
}
renderSleep();

/* ===== 用药 ===== */
let meds = store.get('cg_meds', []);
let medTakes = store.get('cg_med_takes', {});
function renderMeds() {
  const box = document.getElementById('med-list'); box.innerHTML = '';
  const now = new Date();
  meds = meds.filter(m => {
    const start = new Date(m.start);
    const end = new Date(start); end.setDate(end.getDate() + m.days);
    return now <= end;
  });
  store.set('cg_meds', meds);
  if (!meds.length) { box.innerHTML = '<div class="card-body">暂无用药</div>'; return; }
  const today = dateKey();
  meds.forEach((m,i) => {
    const taken = medTakes[today] && medTakes[today][m.name];
    const item = document.createElement('div');
    item.className = 'med-item';
    item.innerHTML = `<span class="m-name">${escapeHtml(m.name)}</span>
      <span class="m-info">${escapeHtml(m.dose)} · ${escapeHtml(m.when)} · 第 ${daysOn(m)}/${m.days} 天</span>
      <button class="m-take${taken?' taken':''}" onclick="takeMed(${i})">${taken?'✓ 已吃':'打卡'}</button>
      <span class="m-del" onclick="delMed(${i})">✕</span>`;
    box.appendChild(item);
  });
}
function daysOn(m) {
  const start = new Date(m.start);
  const now = new Date();
  return Math.max(1, Math.floor((now - start)/86400000) + 1);
}
function addMed() {
  openModal('添加用药', [
    { k:'name', label:'药名', placeholder:'阿莫西林' },
    { k:'dose', label:'剂量', placeholder:'2 粒' },
    { k:'days', label:'持续天数', type:'number', placeholder:'5' },
    { k:'when', label:'服用时间', type:'select', options:['早餐后','午餐后','晚餐后','睡前'], value:'早餐后' },
  ], v => {
    if (!v.name || !v.days) { alert('请填写药名和天数'); return; }
    meds.push({ name: v.name, dose: v.dose||'默认剂量', days: parseInt(v.days), when: v.when, start: dateKey() });
    store.set('cg_meds', meds); renderMeds();
  });
}
function takeMed(i) {
  const today = dateKey();
  medTakes[today] = medTakes[today] || {};
  const m = meds[i];
  if (medTakes[today][m.name]) delete medTakes[today][m.name];
  else medTakes[today][m.name] = true;
  store.set('cg_med_takes', medTakes); renderMeds();
}
function delMed(i) { meds.splice(i,1); store.set('cg_meds', meds); renderMeds(); }
renderMeds();

/* ===== 手环 ===== */
/* ===== 知识库（Obsidian） ===== */
let kbFiles = [];
let kbCurrent = null;
async function renderKb() {
  const side = document.getElementById('kb-side');
  try {
    const r = await fetch('/api/obsidian/list');
    const d = await r.json();
    if (!d.ok) throw new Error(d.error);
    kbFiles = d.files;
    // 按文件夹分组
    const groups = {};
    kbFiles.forEach(f => {
      const g = f.dir || '/';
      (groups[g] = groups[g] || []).push(f);
    });
    side.innerHTML = '';
    Object.keys(groups).sort().forEach(g => {
      side.innerHTML += `<div class="kb-folder">${escapeHtml(g)}</div>`;
      groups[g].forEach(f => {
        const item = document.createElement('div');
        item.className = 'kb-file';
        item.textContent = f.name;
        item.onclick = () => openKb(f);
        side.appendChild(item);
      });
    });
  } catch (e) {
    side.innerHTML = `<div class="card-body">需通过 exe 使用知识库（${escapeHtml(e.message)}）</div>`;
  }
}
async function openKb(f) {
  kbCurrent = f;
  document.querySelectorAll('.kb-file').forEach(x => x.classList.remove('active'));
  const r = await fetch('/api/obsidian/read?path=' + encodeURIComponent(f.path));
  const d = await r.json();
  const view = document.getElementById('kb-view');
  if (d.ok) {
    view.innerHTML = `<pre>${escapeHtml(d.content)}</pre>`;
    document.getElementById('kb-open-btn').style.display = 'inline-block';
  } else {
    view.innerHTML = `<div class="kb-empty">读取失败：${escapeHtml(d.error)}</div>`;
  }
  // 高亮
  document.querySelectorAll('.kb-file').forEach(x => { if (x.textContent === f.name) x.classList.add('active'); });
}
function openKbNote() {
  if (kbCurrent) fetch('/api/obsidian/open?path=' + encodeURIComponent(kbCurrent.path)).catch(()=>{});
}
renderKb();

/* ===== 日记（模板+历史+Obsidian 同步） ===== */
const TEMPLATES = {
  daily: { name:'日常复盘', fields:[
    { k:'wake', l:'起床时间', def:'' }, { k:'sleep', l:'睡觉时间', def:'' },
    { k:'words', l:'背单词（个）', def:'0' }, { k:'py', l:'学 Python（h）', def:'0' },
    { k:'pen', l:'练字（min）', def:'0' }, { k:'summary', l:'今日一句话', def:'' },
  ]},
  study: { name:'学习复盘', fields:[
    { k:'focus', l:'今日专注（h）', def:'0' }, { k:'learned', l:'学到的新知识', def:'' },
    { k:'question', l:'未解决的问题', def:'' }, { k:'tomorrow', l:'明日计划', def:'' },
  ]},
  free: { name:'自由日记', fields:[] },
};
let journalTmpl = store.get('cg_journal_tmpl', 'daily');
let journalData = store.get('cg_journal', {});
function renderTmplBar() {
  const bar = document.getElementById('tmpl-bar'); bar.innerHTML = '';
  Object.entries(TEMPLATES).forEach(([k,t]) => {
    const b = document.createElement('button');
    b.className = 'tmpl-btn' + (k===journalTmpl?' active':'');
    b.textContent = t.name;
    b.onclick = () => { journalTmpl=k; store.set('cg_journal_tmpl',k); renderTmplBar(); renderFields(); };
    bar.appendChild(b);
  });
}
function renderFields() {
  const t = TEMPLATES[journalTmpl];
  const box = document.getElementById('tmpl-fields'); box.innerHTML = '';
  const today = dateKey();
  const data = journalData[today] = journalData[today] || {};
  t.fields.forEach(f => {
    const label = document.createElement('label');
    label.textContent = f.l;
    const inp = document.createElement('input');
    inp.value = data[f.k] !== undefined ? data[f.k] : f.def;
    inp.onchange = () => { data[f.k]=inp.value; store.set('cg_journal', journalData); };
    label.appendChild(inp); box.appendChild(label);
  });
  document.getElementById('journal-free').value = data._free || '';
}
function saveJournal() {
  const today = dateKey();
  const data = journalData[today] = journalData[today] || {};
  data._free = document.getElementById('journal-free').value;
  store.set('cg_journal', journalData);
  const tip = document.getElementById('saved-tip');
  tip.classList.add('show'); setTimeout(()=>tip.classList.remove('show'),1600);
}
function buildObsidianMd(date) {
  const t = TEMPLATES[journalTmpl];
  const data = journalData[date] = journalData[date] || {};
  const lines = [];
  lines.push('---');
  lines.push('tags: [日记]');
  lines.push('created: ' + date);
  lines.push('---');
  lines.push('');
  lines.push('# ' + date + ' 日记');
  if (t.fields.length) {
    lines.push('');
    lines.push('## 📋 ' + t.name);
    lines.push('');
    t.fields.forEach(f => {
      const v = data[f.k] || '';
      if (f.k === 'summary' || f.k === 'learned' || f.k === 'question' || f.k === 'tomorrow') {
        if (v) { lines.push('### ' + f.l); lines.push(v); lines.push(''); }
      } else {
        lines.push('- **' + f.l + '**：' + v);
      }
    });
  }
  if (data._free) {
    lines.push('');
    lines.push('## ✏️ 自由记录');
    lines.push('');
    lines.push(data._free);
  }
  return lines.join('\n');
}
function syncJournal() {
  if (!IS_SERVER) { alert('需通过 exe 使用同步功能'); return; }
  const today = dateKey();
  saveJournal();
  const content = buildObsidianMd(today);
  fetch('/api/journal/sync', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ date: today, title: today + ' 日记', content })
  }).then(r=>r.json()).then(d => {
    if (d.ok) {
      alert('✅ 已同步到 Obsidian：05-日记/' + today + '.md');
      renderJournalHist();
    } else alert('同步失败：' + d.error);
  }).catch(() => alert('同步失败：需通过 exe 使用'));
}
/* 历史日记（读 Obsidian） */
async function renderJournalHist() {
  const box = document.getElementById('journal-hist');
  try {
    const r = await fetch('/api/obsidian/list');
    const d = await r.json();
    const diaryFiles = (d.files || []).filter(f => f.dir.includes('05-日记') && /^\d{4}-\d{2}-\d{2}\.md$/.test(f.name)).sort((a,b)=>b.name.localeCompare(a.name));
    box.innerHTML = '<div class="jh-title">HISTORY // 历史日记</div>';
    if (!diaryFiles.length) { box.innerHTML += '<div class="card-body">还没有日记</div>'; return; }
    diaryFiles.forEach(f => {
      const date = f.name.replace('.md','');
      const item = document.createElement('div');
      item.className = 'jh-date';
      item.innerHTML = `<span>${date}</span><span class="jh-exists">●</span>`;
      item.onclick = async () => {
        document.querySelectorAll('.jh-date').forEach(x => x.classList.remove('active'));
        item.classList.add('active');
        const r2 = await fetch('/api/obsidian/read?path=' + encodeURIComponent(f.path));
        const d2 = await r2.json();
        let preview = document.querySelector('.jh-preview');
        if (!preview) { preview = document.createElement('div'); preview.className = 'jh-preview'; box.appendChild(preview); }
        preview.textContent = d2.ok ? d2.content.slice(0, 500) : '读取失败';
      };
      box.appendChild(item);
    });
  } catch {
    box.innerHTML = '<div class="jh-title">HISTORY</div><div class="card-body">需通过 exe 查看历史日记</div>';
  }
}
renderTmplBar(); renderFields(); renderJournalHist();

/* ===== 夜间复盘 ===== */
let reviewDoneToday = store.get('cg_review_done', {});
function maybeShowReview() { return; // 已禁用 return; // 已禁用自动弹窗（星系自测）
  const now = new Date();
  const h = now.getHours();
  if (h >= 21 || h < 3) {  // 21:00 - 3:00
    if (!reviewDoneToday[dateKey()]) {
      // 预填：今日聚焦完成情况 + 完成待办 + 学习追踪 + DDL 汇总
      const today = dateKey();
      const lines = [];
      // 今日聚焦
      const fDone = focus.filter(f => f.done);
      const fLeft = focus.filter(f => !f.done);
      if (focus.length) {
        lines.push('【今日聚焦】');
        fDone.forEach(f => lines.push('✅ ' + f.t));
        fLeft.forEach(f => lines.push('⬜ ' + f.t));
      }
      // 今日学习追踪
      const tt = store.get('cg_track_today', {})[today];
      if (tt && (tt.c || tt.py || tt.lc)) {
        lines.push('【今日学习】');
        if (tt.c) lines.push('📗 C 语言 +' + tt.c + ' 集');
        if (tt.py) lines.push('🐍 Python +' + tt.py + ' 章');
        if (tt.lc) lines.push('💻 LeetCode +' + tt.lc + ' 题');
      }
      // 喝水打卡
      const waterCount = (typeof water !== 'undefined') ? (water || 0) : 0;
      if (waterCount > 0) lines.push('【健康】💧 喝了 ' + waterCount + '/8 杯');
      // 完成待办
      const doneToday = todos.filter(t => t.done).map(t => '• ' + t.t);
      if (doneToday.length) lines.push('【完成待办】' + doneToday.join('\n'));
      // 项目进度（try 保护：projects 可能未初始化）
      try {
        if (typeof projects !== 'undefined' && projects.length) {
          const actProj = projects.filter(p => p.status === '进行中');
          if (actProj.length) lines.push('【项目】' + actProj.map(p => p.name + ' ' + p.progress + '%').join(' / '));
        }
      } catch(e) {}
      if (lines.length) document.getElementById('rm-done').value = lines.join('\n');
      // DDL 汇总
      const dueSoon = ddls.filter(d => {
        const end = new Date(d.end); end.setHours(0,0,0,0);
        const t2 = new Date(); t2.setHours(0,0,0,0);
        const days = Math.round((end - t2)/86400000);
        return days >= 0 && days <= 3;
      }).map(d => '• ' + d.name + '（' + d.end + '）');
      if (dueSoon.length) document.getElementById('rm-tomorrow').placeholder = '明天要做的：\n' + dueSoon.join('\n');
      // 已禁用夜间复盘自动弹窗
    }
  }
}
function closeReview() { document.getElementById('review-modal').classList.remove('open'); }
function saveReview() {
  const done = document.getElementById('rm-done').value.trim();
  const blocked = document.getElementById('rm-blocked').value.trim();
  const tomorrow = document.getElementById('rm-tomorrow').value.trim();
  let reviews = store.get('cg_reviews', {});
  reviews[dateKey()] = { done, blocked, tomorrow, time: new Date().toISOString() };
  store.set('cg_reviews', reviews);
  // 明日聚焦
  if (tomorrow) {
    const lines = tomorrow.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,3);
    if (lines.length) { focus = lines.map(t => ({ t, done: false })); store.set('cg_focus', focus); renderFocus(); }
  }
  reviewDoneToday[dateKey()] = true;
  store.set('cg_review_done', reviewDoneToday);
  document.getElementById('review-modal').classList.remove('open');
  document.getElementById('rm-done').value='';
  document.getElementById('rm-blocked').value='';
  document.getElementById('rm-tomorrow').value='';
  alert('✅ 复盘完成，明天的聚焦已更新');
}
// /* setTimeout(maybeShowReview, 5000); 已禁用 */ // 临时禁用（截图自测用） // 延迟到所有变量初始化后;

/* ===== 搜索（修复：不再窗口内跳转） ===== */
const searchInput = document.getElementById('global-search');
if (!searchInput) {
  // v9 指挥台没有搜索框，放在抽屉里由快捷入口替代；但保留 Enter 键全局搜索支持
}

/* ===== 聊天 ===== */
let chatHistory = [];
function toggleChat() { document.getElementById('chat-panel').classList.toggle('open'); }
function openTeacher() {
  // 通过 exe 打开老师对话窗口（新 Electron 窗口加载 Control UI）
  if (IS_SERVER) {
    fetch('/api/teacher').catch(()=>{});
    document.getElementById('chat-panel').classList.remove('open');
  } else {
    window.open('http://127.0.0.1:18789/', '_blank');
  }
}
function addChatMsg(role, text) {
  const body = document.getElementById('chat-body');
  const msg = document.createElement('div');
  msg.className = 'msg';
  msg.innerHTML = role === 'user' ? `<b>宝宝：</b>${escapeHtml(text)}` : `<b>老师：</b>${escapeHtml(text)}`;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}
function sendChat() {
  const inp = document.getElementById('chat-text');
  const v = inp.value.trim(); if (!v) return;
  addChatMsg('user', v);
  inp.value = '';
  chatHistory.push({ role: 'user', content: v });
  const body = document.getElementById('chat-body');
  const thinking = document.createElement('div');
  thinking.className = 'msg'; thinking.id = 'chat-thinking';
  thinking.innerHTML = `<b>老师：</b><span style="color:var(--text-faint)">思考中…</span>`;
  body.appendChild(thinking);
  body.scrollTop = body.scrollHeight;
  const api = IS_SERVER ? '/api/chat' : null;
  if (!api) {
    const t = document.getElementById('chat-thinking');
    if (t) t.remove();
    addChatMsg('assistant', '聊天需通过电脑 exe 使用（OpenClaw 只在本机可用）。');
    return;
  }
  fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openclaw/default', messages: chatHistory.slice(-10), max_tokens: 500 })
  }).then(r => r.json()).then(d => {
    const reply = d.choices && d.choices[0] && d.choices[0].message
      ? d.choices[0].message.content
      : (d.error ? '连接失败：' + d.error.message : '无回复');
    const t = document.getElementById('chat-thinking');
    if (t) t.remove();
    addChatMsg('assistant', reply);
    chatHistory.push({ role: 'assistant', content: reply });
  }).catch(() => {
    const t = document.getElementById('chat-thinking');
    if (t) t.remove();
    addChatMsg('assistant', '连不上 OpenClaw（需要电脑端 exe + OpenClaw 同时运行）。');
  });
}

/* ===== v10 精简：隐藏已停用模块 ===== */
(function hideRemovedModules() {
  const titles = ['专注番茄钟', '间隔复习', '费曼输出', '手环数据'];
  document.querySelectorAll('.card').forEach(card => {
    const head = card.querySelector('.card-head');
    if (head) {
      const txt = head.textContent || '';
      if (titles.some(t => txt.includes(t))) card.style.display = 'none';
    }
  });
  // 数据图表（.grid.data-grid）
  document.querySelectorAll('.grid.data-grid').forEach(g => { g.style.display = 'none'; });
})();

/* ===== 问题拆解画布 ===== */
let splits = store.get('cg_splits', []);
function addSplit() {
  const inp = document.getElementById('split-goal');
  const goal = (inp.value || '').trim();
  if (!goal) { alert('输入要拆解的问题'); return; }
  splits.push({ goal, subs: ['', '', ''], done: [false, false, false] });
  inp.value = '';
  store.set('cg_splits', splits);
  renderSplits();
}
function renderSplits() {
  const box = document.getElementById('split-list');
  box.innerHTML = '';
  if (!splits.length) { box.innerHTML = '<div class="card-body">还没有拆解。输入一个大问题开始。</div>'; return; }
  splits.forEach((s, si) => {
    const item = document.createElement('div');
    item.className = 'mini-card';
    let subsHtml = '';
    s.subs.forEach((sub, i) => {
      subsHtml += '<div style="display:flex;gap:8px;margin:8px 0;align-items:center">' +
        '<input class="inline-input" placeholder="子问题 ' + (i+1) + '" value="' + escapeHtml(sub) + '" ' +
        'onchange="updateSub(' + si + ',' + i + ',this.value)" style="flex:1">' +
        '<button class="mini-btn ghost" style="padding:7px 10px;font-size:11px" onclick="subToTodo(' + si + ',' + i + ')">→待办</button>' +
        '<span style="cursor:pointer;color:var(--text-faint)" onclick="delSub(' + si + ',' + i + ')">✕</span>' +
        '</div>';
    });
    item.innerHTML = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">' +
      '<span style="font-weight:600;font-size:13px;color:var(--text);flex:1">🎯 ' + escapeHtml(s.goal) + '</span>' +
      '<span style="cursor:pointer;color:var(--text-faint);font-size:11px" onclick="addSub(' + si + ')">＋子问题</span>' +
      '<span style="cursor:pointer;color:var(--text-faint)" onclick="delSplit(' + si + ')">✕</span></div>' + subsHtml;
    box.appendChild(item);
  });
}

function addSub(si) {
  splits[si].subs.push('');
  splits[si].done.push(false);
  store.set('cg_splits', splits);
  renderSplits();
}
function updateSub(si, i, val) { splits[si].subs[i] = val; store.set('cg_splits', splits); }
function subToTodo(si, i) {
  const text = splits[si].subs[i].trim();
  if (!text) { alert('先填子问题内容'); return; }
  // ⑤ 查找关联该拆解的项目（splitIdx 匹配）
  let projTag = '';
  if (typeof projects !== 'undefined') {
    const linked = projects.find(p => p.links.splitIdx === '#' + (si+1));
    if (linked) projTag = '📁' + linked.name + ' ';
  }
  todos.unshift({ t: '🧩 ' + projTag + text, done: false, pri: '#d4af6a' });
  store.set('cg_todos', todos); renderTodos();
  splits[si].subs[i] = '';
  store.set('cg_splits', splits); renderSplits();
  alert('✅ 已加入待办' + (projTag ? '（项目：' + projTag.trim() + '）' : ''));
}
function delSub(si, i) { splits[si].subs[i] = ''; store.set('cg_splits', splits); renderSplits(); }
function delSplit(si) { splits.splice(si, 1); store.set('cg_splits', splits); renderSplits(); }
renderSplits();

/* ===== 实时天气（open-meteo，免费无 key） ===== */
const WX = {
  // WMO 天气码 → 中文
  codes: { 0:'晴', 1:'晴间多云', 2:'多云', 3:'阴', 45:'雾', 48:'雾凇', 51:'毛毛雨', 53:'毛毛雨', 55:'毛毛雨', 61:'小雨', 63:'中雨', 65:'大雨', 71:'小雪', 73:'中雪', 75:'大雪', 80:'阵雨', 81:'阵雨', 82:'强阵雨', 95:'雷雨', 96:'雷雨+冰雹', 99:'雷暴' },
  icons: { 0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️', 45:'🌫️', 48:'🌫️', 51:'🌦️', 53:'🌦️', 55:'🌦️', 61:'🌧️', 63:'🌧️', 65:'🌧️', 71:'🌨️', 73:'🌨️', 75:'❄️', 80:'🌦️', 81:'🌧️', 82:'⛈️', 95:'⛈️', 96:'⛈️', 99:'⛈️' }
};
function wxCode(c) { return c === undefined ? 0 : c; }
function renderWeather(data) {
  const w = data.current_weather;
  const box = document.getElementById('weather-widget');
  if (!box) return;
  const code = wxCode(w.weathercode);
  const desc = WX.codes[code] || '未知';
  const icon = WX.icons[code] || '🌡️';
  const time = (w.time || '').slice(11, 16);
  box.innerHTML = '<span style="font-size:22px">' + icon + '</span>' +
    '<span style="font-family:var(--mono);font-size:16px;font-weight:600;color:var(--text)">' + Math.round(w.temperature) + '°C</span>' +
    '<span style="font-size:12px;color:var(--text-dim)">' + desc + '</span>' +
    '<span style="font-size:10px;color:var(--text-faint);font-family:var(--mono)">无锡 · ' + time + ' 更新</span>';
}
function loadWeather() {
  const box = document.getElementById('weather-widget');
  if (box) box.innerHTML = '<span style="font-family:var(--mono);font-size:11px;color:var(--text-faint);letter-spacing:.18em">LOADING WEATHER…</span>';
  // 无锡：纬度 31.57，经度 120.29
  fetch('https://api.open-meteo.com/v1/forecast?latitude=31.57&longitude=120.29&current_weather=true')
    .then(r => r.json())
    .then(renderWeather)
    .catch(() => {
      const b = document.getElementById('weather-widget');
      if (b) b.innerHTML = '<span style="font-family:var(--mono);font-size:11px;color:var(--text-faint)">天气加载失败（需联网）</span>';
    });
}
loadWeather();
setInterval(loadWeather, 30 * 60 * 1000); // 30 分钟刷新

/* ===== 对话抽屉快速问答 ===== */
let chat2History = [];
function sendChat2() {
  const inp = document.getElementById('chat-text2');
  const v = (inp.value || '').trim(); if (!v) return;
  const body = document.getElementById('chat-body2');
  body.innerHTML += '<div style="margin-bottom:8px"><b style="color:var(--accent)">宝宝：</b>' + escapeHtml(v) + '</div>';
  body.innerHTML += '<div style="margin-bottom:8px;color:var(--text-faint)" id="chat2-thinking">思考中…</div>';
  inp.value = '';
  body.scrollTop = body.scrollHeight;
  chat2History.push({ role: 'user', content: v });
  const api = IS_SERVER ? '/api/chat' : null;
  if (!api) {
    const t = document.getElementById('chat2-thinking');
    if (t) t.remove();
    body.innerHTML += '<div style="margin-bottom:8px"><b style="color:var(--accent)">老师：</b>需通过 exe 使用</div>';
    return;
  }
  fetch(api, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ model: 'openclaw/default', messages: chat2History.slice(-10), max_tokens: 500 })
  }).then(r=>r.json()).then(d => {
    const reply = d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : (d.error ? '连接失败：' + d.error.message : '无回复');
    const t = document.getElementById('chat2-thinking');
    if (t) t.remove();
    body.innerHTML += '<div style="margin-bottom:8px"><b style="color:var(--accent)">老师：</b>' + escapeHtml(reply) + '</div>';
    chat2History.push({ role: 'assistant', content: reply });
    body.scrollTop = body.scrollHeight;
    // 🚀 对话操作应用：识别回复中的应用名并启动
    try {
      const lastUser = chat2History[chat2History.length-2];
      if (lastUser && lastUser.role === 'user') {
        const ut = lastUser.content;
        if (/(打开|启动|运行|开一下|帮我开)/.test(ut) && typeof appLaunchers !== 'undefined') {
          const hit = appLaunchers.find(a => ut.toLowerCase().includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(ut.toLowerCase().replace(/打开|启动|运行|一下|帮我|请|软件|应用/g,'').trim()));
          if (hit) {
            const idx = appLaunchers.indexOf(hit);
            launchApp(idx);
            body.innerHTML += '<div style="margin-bottom:8px;font-size:11px;color:var(--green)">⚡ 已启动：' + escapeHtml(hit.name) + '</div>';
          }
        }
      }
    } catch(e) {}
  }).catch(() => {
    const t = document.getElementById('chat2-thinking');
    if (t) t.remove();
    body.innerHTML += '<div style="margin-bottom:8px"><b style="color:var(--accent)">老师：</b>连不上 OpenClaw</div>';
  });
}

/* ===== 全局刷新（实时同步用） ===== */
function refreshAll() {
  try { if (typeof renderFocus === 'function') renderFocus(); } catch(e) {}
  try { if (typeof renderDDL === 'function') renderDDL(); } catch(e) {}
  try { if (typeof renderDDLList === 'function') renderDDLList(); } catch(e) {}
  try { if (typeof renderTodos === 'function') renderTodos(); } catch(e) {}
  try { if (typeof renderSchedule === 'function') renderSchedule(); } catch(e) {}
  try { if (typeof renderTimetable === 'function') renderTimetable(); } catch(e) {}
  try { if (typeof renderClubs === 'function') renderClubs(); } catch(e) {}
  
  try { if (typeof renderWater === 'function') renderWater(); } catch(e) {}
  try { if (typeof renderSleep === 'function') renderSleep(); } catch(e) {}
  try { if (typeof renderMeds === 'function') renderMeds(); } catch(e) {}
  try { if (typeof renderSplits === 'function') renderSplits(); } catch(e) {}
  try { if (typeof renderJournalHist === 'function') renderJournalHist(); } catch(e) {}
  try { if (typeof renderDocs === 'function') renderDocs(); } catch(e) {}
  try { if (typeof renderFiles === 'function') renderFiles(); } catch(e) {}
  try { if (typeof renderGrowth === 'function') renderGrowth(); } catch(e) {}
  try { if (typeof renderKb === 'function') renderKb(); } catch(e) {}
  try { if (typeof renderTrack === 'function') renderTrack(); } catch(e) {}
  try { if (typeof renderProjects === 'function') renderProjects(); } catch(e) {}

}

/* ===== 学习追踪（通用型：可自定义项目） ===== */
let track = store.get('cg_track', [
  { key: 'c', name: '📗 C 语言', cur: 6, goal: 165, unit: '集', step: 1, link: 'bilibili://video/BV1Xa4y1k7LU' },
  { key: 'py', name: '🐍 Python', cur: 1, goal: 30, unit: '章', step: 1, link: 'https://www.runoob.com/python3/python3-tutorial.html' },
  { key: 'lc', name: '💻 LeetCode', cur: 0, goal: 50, unit: '题', step: 1, link: 'https://leetcode.cn' },
  { key: 'en', name: '📖 英语单词', cur: 320, goal: 4500, unit: '词', step: 30, link: '' },
  { key: 'other', name: '📌 其他进度', cur: 0, goal: 10, unit: '项', link: '' },
]);
// 迁移旧结构（{c:n} 对象 → 数组），保留已打卡数据
(function migrateOldTrack() {
  if (!Array.isArray(track)) {
    const oldObj = track || {};
    track = [
      { key: 'c', name: '📗 C 语言', cur: oldObj.c || 0, goal: 165, unit: '集', step: 1, link: 'bilibili://video/BV1Xa4y1k7LU' },
      { key: 'py', name: '🐍 Python', cur: oldObj.py || 0, goal: 30, unit: '章', step: 1, link: 'https://www.runoob.com/python3/python3-tutorial.html' },
      { key: 'lc', name: '💻 LeetCode', cur: oldObj.lc || 0, goal: 50, unit: '题', step: 1, link: 'https://leetcode.cn' },
      { key: 'en', name: '📖 英语单词', cur: 0, goal: 4500, unit: '词', step: 30, link: '' },
      { key: 'other', name: '📌 其他进度', cur: 0, goal: 10, unit: '项', link: '', kw: [] },
    ];
    store.set('cg_track', track);
  }
})();
// 迁移旧学习进度数据（cg_progress → cg_track），首次运行合并
(function migrateTrack() {
  const old = store.get('cg_progress', []);
  if (old && old.length) {
    const nameMap = { '英语单词': 'en', 'Python': 'py', 'C 语言': 'c' };
    track.forEach(t => {
      const match = old.find(p => nameMap[p.name] === t.key);
      if (match && !t.cur) { t.cur = match.cur; t.goal = match.goal; }
    });
    store.set('cg_track', track);
  }
})();

/* ===== 打卡统计辅助 ===== */
function trackDayData(key) {
  // 返回：近7天 {日期: 数量} + streak + 本周打卡天数
  const tt = store.get('cg_track_today', {});
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    days.push({ key: k, n: (tt[k] || {})[key] || 0, wd: '日一二三四五六'[d.getDay()] });
  }
  // 连续天数（从今天往前数）
  let streak = 0;
  const todayK = days[6].key;
  if ((tt[todayK] || {})[key] > 0) {
    streak = 1;
    for (let i = 5; i >= 0; i--) {
      if ((tt[days[i].key] || {})[key] > 0) streak++;
      else break;
    }
  }
  const weekDone = days.filter(d => d.n > 0).length;
  return { days, streak, weekDone };
}
function renderTrack() {
  const area = document.getElementById('track-area');
  if (!area) return;
  area.innerHTML = '';
  track.forEach(d => {
    const cur = d.cur || 0;
    const pct = Math.min(100, Math.round(cur / d.goal * 100));
    const stat = trackDayData(d.key);
    const row = document.createElement('div');
    row.className = 'progress-row';
    // 近7天格子（GitHub 风格）
    let cells = '';
    stat.days.forEach(dd => {
      cells += '<span style="display:inline-block;width:16px;height:16px;border-radius:4px;margin-right:3px;' +
        (dd.n > 0 ? 'background:var(--accent);' : 'background:rgba(212,175,106,0.12);') +
        '" title="' + dd.key + ' ' + dd.n + '"></span>';
    });
    row.innerHTML = '<div class="progress-head"><span class="name">' + d.name + '</span>' +
      '<span class="pct">' + cur + '/' + d.goal + ' ' + d.unit + ' [' + pct + '%]</span></div>' +
      '<div class="progress-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
      '<span style="font-size:11px">' + cells + '</span>' +
      (stat.streak > 0 ? '<span style="font-size:11px;color:var(--yellow)">🔥 连续 ' + stat.streak + ' 天</span>' : '') +
      '<span style="font-size:11px;color:var(--text-faint)">本周 ' + stat.weekDone + '/7</span>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:6px">' +
      '<button class="mini-btn" style="flex:1;font-size:11px" onclick="trackStart(&quot;' + d.key + '&quot;)" title="打开学习软件/课程">▶ 开始</button>' +
      '<button class="mini-btn ghost" style="flex:1;font-size:11px" onclick="trackAdd(&quot;' + d.key + '&quot;)" title="学完再点">➕ 打卡</button>' +
      '<button class="mini-btn ghost" style="flex:1;font-size:11px" onclick="trackEdit(&quot;' + d.key + '&quot;)">✏️</button>' +
      '<button class="mini-btn ghost" style="flex:1;font-size:11px" onclick="trackDel(&quot;' + d.key + '&quot;)" title="删除">✕</button>' +
      '</div>';
    area.appendChild(row);
  });
}
function trackAdd(key) {
  const d = track.find(x => x.key === key);
  if (!d) return;
  const step = d.step || 1;
  d.cur = (d.cur || 0) + step;
  store.set('cg_track', track);
  // 记录今日打卡（步进）
  const today = dateKey();
  const tt = store.get('cg_track_today', {});
  tt[today] = tt[today] || {};
  tt[today][key] = (tt[today][key] || 0) + step;
  store.set('cg_track_today', tt);
  // 🔗 联动：勾选绑定该追踪的聚焦项（手动绑定，非关键词）
  let linked = false;
  focus.forEach((f, i) => {
    if (!f.done && f.bind === key) { f.done = true; linked = true; }
  });
  if (linked) { store.set('cg_focus', focus); renderFocus(); }
  renderTrack();
}
function trackEdit(key) {
  const d = track.find(x => x.key === key);
  if (!d) return;
  const startApps = d.startApps ? d.startApps.join(' + ') : '';
  openModal('更新：' + d.name, [
    { k: 'val', label: '当前进度（' + d.goal + ' ' + d.unit + '）', placeholder: String(d.cur || 0) },
    { k: 'step', label: '每次打卡 +多少（' + d.unit + '）', placeholder: String(d.step || 1) },
    { k: 'goal', label: '目标（' + d.unit + '）', placeholder: String(d.goal) },
    { k: 'startApps', label: '▶开始 启动的软件（勾选，可多选）', type:'multicheck', options: (typeof appLaunchers !== 'undefined' ? appLaunchers : []).map(a=>a.name), value: d.startApps || [] },
    { k: 'startUrls', label: '▶开始 打开的网页（用 + 分隔，可和软件同时开）', placeholder: (d.startUrls||[]).join(' + ') || '如：https://www.runoob.com/python3/python3-tutorial.html' },
    { k: 'wf', label: '或关联工作流（▶开始 时批量启动）', type:'select', options:['（不用工作流）'].concat((typeof workflows !== 'undefined' ? workflows : []).map(w=>w.name)) }
  ], v => {
    d.cur = Math.max(0, parseInt(v.val) || 0);
    d.step = Math.max(1, parseInt(v.step) || 1);
    d.goal = Math.max(1, parseInt(v.goal) || d.goal);
    if (v.startApps) {
      d.startApps = v.startApps.split(',').map(s=>s.trim()).filter(Boolean);
    } else {
      delete d.startApps;
    }
    if (v.startUrls && v.startUrls.trim()) {
      d.startUrls = v.startUrls.split('+').map(s=>s.trim()).filter(Boolean);
    } else {
      delete d.startUrls;
    }
    if (v.wf && v.wf !== '（不用工作流）') {
      d.wf = v.wf;
      delete d.startApps; delete d.startUrls; // 工作流优先，清掉自定义
    } else {
      delete d.wf;
    }
    if (v.wf && v.wf !== '（不用工作流）') {
      d.wf = v.wf;
    } else {
      delete d.wf;
    }
    store.set('cg_track', track);
    renderTrack();
  });
}
renderTrack();

/* ===== 添加自定义追踪项目 ===== */
function trackAddItem() {
  openModal('添加追踪项目', [
    { k: 'name', label: '项目名称', placeholder: '如：健身 / 读书 / 家教' },
    { k: 'goal', label: '目标数量', placeholder: '如：30' },
    { k: 'unit', label: '单位', placeholder: '如：次 / 本 / 课时' }
  ], v => {
    const name = (v.name || '').trim();
    const goal = parseInt(v.goal) || 10;
    const unit = (v.unit || '').trim() || '次';
    if (!name) { alert('填项目名称'); return; }
    track.push({ key: 'x' + Date.now(), name: '📌 ' + name, cur: 0, goal, unit, link: '', kw: [name] });
    store.set('cg_track', track);
    renderTrack();
  });
}
function trackDel(key) {
  const d = track.find(x => x.key === key);
  if (!d) return;
  if (!confirm('删除「' + d.name + '」？默认项可点「恢复默认」找回。')) return;
  track = track.filter(x => x.key !== key);
  store.set('cg_track', track);
  renderTrack();
}
function trackReset() {
  if (!confirm('恢复默认追踪项？（保留已打卡数据）')) return;
  const defaults = [
    { key: 'c', name: '📗 C 语言', cur: 0, goal: 165, unit: '集', step: 1, link: 'bilibili://video/BV1Xa4y1k7LU' },
    { key: 'py', name: '🐍 Python', cur: 0, goal: 30, unit: '章', step: 1, link: 'https://www.runoob.com/python3/python3-tutorial.html' },
    { key: 'lc', name: '💻 LeetCode', cur: 0, goal: 50, unit: '题', step: 1, link: 'https://leetcode.cn' },
    { key: 'en', name: '📖 英语单词', cur: 0, goal: 4500, unit: '词', step: 30, link: '' },
  ];
  // 合并：已有默认项保留数据，缺失的补回
  defaults.forEach(dd => {
    const exist = track.find(x => x.key === dd.key);
    if (!exist) track.push(dd);
  });
  store.set('cg_track', track);
  renderTrack();
}

/* ===== 打开外部链接（B站客户端协议等） ===== */
function openExternalUrl(u) {
  if (!u) return;
  if (IS_SERVER) {
    fetch('/api/open-url?url=' + encodeURIComponent(u)).catch(() => {});
  } else {
    window.open(u);
  }
}

/* ===== DDL 到期自动转待办 ===== */
function autoConvertDDL() {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const converted = [];
    const remaining = ddls.filter(d => {
      const end = new Date(d.end); end.setHours(0,0,0,0);
      if (end < today) {
        // 已过期且未转待办的 → 转
        const exists = todos.some(t => t.t.includes(d.name));
        if (!exists) converted.push(d.name);
        return false;
      }
      return true;
    });
    if (converted.length) {
      converted.forEach(name => todos.unshift({ t: '📌 ' + name + '（已到期）', done: false, pri: '#ff5c5c' }));
      store.set('cg_todos', todos);
      if (typeof renderTodos === 'function') renderTodos();
    }
    if (remaining.length !== ddls.length) {
      ddls = remaining;
      store.set('cg_ddls', ddls);
      if (typeof renderDDL === 'function') renderDDL();
      if (typeof renderDDLList === 'function') renderDDLList();
    }
  } catch(e) {}
}
autoConvertDDL();
setInterval(autoConvertDDL, 60000); // 每分钟检查一次

/* ===== 项目管理 ===== */
let projects = store.get('cg_projects', [
  { id: 1, name: 'COOPER OS', type: '软件', version: '10.3.0', ddl: '', status: '进行中', progress: 70, links: { ddl: false, todo: true, track: false, split: true, trackKey: '', splitIdx: '' } },
  { id: 2, name: '大学入学准备', type: '学习', version: '', ddl: '2026-09-01', status: '进行中', progress: 30, links: { ddl: true, todo: true, track: true, split: false, trackKey: '', splitIdx: '' } },
]);
const PROJ_STATUS = { '进行中':'🟢', '暂停':'🟡', '完成':'✅', '放弃':'⚪' };

function addProject() {
  openModal('新建项目', [
    { k:'name', label:'项目名称', placeholder:'如：COOPER OS / 家教服务 / 学 C' },
    { k:'type', label:'类型', type:'select', options:['软件','学习','生活','其他'] },
    { k:'version', label:'版本号（软件类才填）', placeholder:'如：1.0.0' },
    { k:'ddl', label:'DDL（选填，点右侧选日期）', type:'date' },
    { k:'status', label:'状态', type:'select', options:['进行中','暂停','完成','放弃'] },
    { k:'priority', label:'优先级', type:'select', options:['🔴 高','🟡 中','⚪ 低'] },
    { k:'progress', label:'进度 %', placeholder:'0' },
    { k:'links', label:'联动板块（按住 Ctrl 多选）', type:'multi', options:['同步 DDL 到 DDL 板块','生成子任务 → 待办','关联学习追踪','关联拆解画布'] },
    { k:'trackKey', label:'关联追踪：选具体项目（选上面的"关联学习追踪"后生效）', type:'select', options:['不关联'].concat(track.map(d=>d.name)) },
    { k:'splitIdx', label:'关联拆解：选具体拆解（选上面的"关联拆解画布"后生效）', type:'select', options:['不关联'].concat(splits.map((s,i)=>'#'+(i+1)+' '+(s.goal.length>14?s.goal.slice(0,14)+'…':s.goal))) },
  ], v => {
    const name = (v.name || '').trim(); if (!name) { alert('填项目名称'); return; }
    const type = v.type || '其他';
    const lkArr = v.links || [];
    const links = {
      ddl: lkArr.includes('同步 DDL 到 DDL 板块'),
      todo: lkArr.includes('生成子任务 → 待办'),
      track: lkArr.includes('关联学习追踪'),
      split: lkArr.includes('关联拆解画布'),
      trackKey: (lkArr.includes('关联学习追踪') && v.trackKey && v.trackKey !== '不关联') ? v.trackKey : '',
      splitIdx: (lkArr.includes('关联拆解画布') && v.splitIdx && v.splitIdx !== '不关联') ? v.splitIdx : '',
    };
    const proj = {
      id: Date.now(),
      name, type,
      version: type === '软件' ? (v.version || '').trim() : '',
      ddl: (v.ddl || '').trim(),
      status: v.status || '进行中',
      priority: v.priority ? v.priority.split(' ')[1] : '中',
      progress: Math.min(100, Math.max(0, parseInt(v.progress) || 0)),
      links,
    };
    projects.push(proj);
    store.set('cg_projects', projects);
    // 联动：同步 DDL
    if (proj.ddl && links.ddl) {
      ddls.push({ id: Date.now(), name: '📁 ' + proj.name, end: proj.ddl });
      store.set('cg_ddls', ddls);
      if (typeof renderDDL === 'function') renderDDL();
      if (typeof renderDDLList === 'function') renderDDLList();
    }
    renderProjects();
  });
}

function renderProjects() {
  const box = document.getElementById('project-area');
  if (!box) return;
  box.innerHTML = '';
  if (!projects.length) { box.innerHTML = '<div class="card-body">还没有项目。点「＋ 新建项目」开始。</div>'; return; }
  // 按状态分组看板
  const groups = ['进行中','暂停','完成','放弃'];
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px';
  const PRIO = { '高': 0, '中': 1, '低': 2 };
  groups.forEach(st => {
    const list = projects.filter(p => p.status === st).sort((a,b) => (PRIO[a.priority||'中']||1) - (PRIO[b.priority||'中']||1));
    const col = document.createElement('div');
    col.innerHTML = '<div style="font-size:11px;color:var(--text-faint);margin-bottom:8px">' + (PROJ_STATUS[st]||'') + ' ' + st + ' (' + list.length + ')</div>';
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'proj-card';
      // ④ 关联追踪：进度自动算（链接追踪项的平均进度）
      let autoPct = p.progress || 0;
      let autoTxt = '';
      if (p.links.trackKey && typeof track !== 'undefined') {
        const t = track.find(x => x.name === p.links.trackKey);
        if (t) {
          autoPct = Math.round((t.cur||0) / t.goal * 100);
          autoTxt = '（' + t.name + '自动）';
        }
      }
      card.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
        '<b style="font-size:13px">' + (p.priority==='高'?'🔴 ':p.priority==='低'?'⚪ ':'🟡 ') + escapeHtml(p.name) + '</b>' +
        '<span style="cursor:pointer;color:var(--text-faint);font-size:11px" onclick="delProject(' + p.id + ')">✕</span></div>' +
        (p.type === '软件' && p.version ? '<div style="font-family:var(--mono);font-size:11px;color:var(--accent);margin-bottom:4px">v' + escapeHtml(p.version) + '</div>' : '') +
        '<div style="font-size:11px;color:var(--text-dim);margin-bottom:6px">' + (p.ddl ? '⏰ ' + p.ddl : '') + (p.links.track ? ' · 🔗追踪' : '') + (p.links.split ? ' · 🧩拆解' : '') + '</div>' +
        '<div class="progress-bar" style="margin-bottom:4px"><i style="width:' + autoPct + '%"></i></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-faint)">' +
        '<span>' + autoPct + '%' + autoTxt + '</span><span onclick="editProject(' + p.id + ')" style="cursor:pointer;color:var(--accent)">编辑</span></div>';
      col.appendChild(card);
    });
    wrap.appendChild(col);
  });
  box.appendChild(wrap);
}

function editProject(id) {
  const p = projects.find(x => x.id === id); if (!p) return;
  openModal('编辑项目：' + p.name, [
    { k:'status', label:'状态', type:'select', options:['进行中','暂停','完成','放弃'] },
    { k:'priority', label:'优先级', type:'select', options:['🔴 高','🟡 中','⚪ 低'] },
    { k:'progress', label:'进度 %', placeholder: String(p.progress) },
    { k:'version', label:'版本号（软件类）', placeholder: p.version },
  ], v => {
    p.status = v.status || p.status;
    p.priority = v.priority ? v.priority.split(' ')[1] : (p.priority || '中');
    p.progress = Math.min(100, Math.max(0, parseInt(v.progress) || 0));
    if (p.type === '软件') p.version = (v.version || '').trim();
    store.set('cg_projects', projects);
    renderProjects();
  });
}

function delProject(id) {
  const p = projects.find(x => x.id === id); if (!p) return;
  if (!confirm('删除项目「' + p.name + '」？')) return;
  projects = projects.filter(x => x.id !== id);
  store.set('cg_projects', projects);
  // 联动：移除 DDL 板块里来自该项目的 DDL
  ddls = ddls.filter(d => d.name !== '📁 ' + p.name);
  store.set('cg_ddls', ddls);
  if (typeof renderDDL === 'function') renderDDL();
  if (typeof renderDDLList === 'function') renderDDLList();
  renderProjects();
}
renderProjects();

/* ===== 本周打卡图表（近 7 天柱状图，Canvas 2D） ===== */
/* ===== 早间简报（每天首次打开显示一次） ===== */
function showMorningBrief() {
  const today = dateKey();
  const shown = store.get('cg_brief_shown', {});
  if (shown[today]) return; // 今天已看过
  // 只显示一次，但标记为已看（避免每次刷新都弹）
  shown[today] = true;
  store.set('cg_brief_shown', shown);
  const now = new Date();
  const h = now.getHours();
  // 早上 5-12 点显示完整简报，其他时间显示精简版
  const isMorning = h >= 5 && h < 12;
  const wd = ['日','一','二','三','四','五','六'][now.getDay()];
  const lines = [];
  lines.push('📅 ' + (now.getMonth()+1) + '月' + now.getDate() + '日 周' + wd);
  // 昨晚睡眠（从作息记录取最近一条，排除今天）
  try {
    const sl = store.get('cg_sleep', {});
    const keys = Object.keys(sl).filter(k => k !== today).sort();
    if (keys.length) {
      const last = sl[keys[keys.length-1]];
      if (last && last.hours) {
        const hrs = last.hours;
        lines.push('🌙 昨晚睡了 ' + hrs + ' 小时' + (hrs < 7 ? ' ⚠️ 有点少，注意休息' : (hrs >= 9 ? ' ✅ 睡得不错' : '')));
      }
    }
  } catch(e) {}
  // 今日课程
  const day = now.getDay();
  const todayCourses = (courses || []).filter(c => c.day === day && courseShown(c)).sort((a,b)=>a.start.localeCompare(b.start));
  if (todayCourses.length) {
    lines.push('');
    lines.push('🏫 今日课程 (' + todayCourses.length + ' 节)');
    todayCourses.forEach(c => lines.push('  ' + c.start + ' ' + c.name + (c.place ? ' @' + c.place : '')));
  } else {
    lines.push('');
    lines.push('🏫 今日无课');
  }
  // DDL 近 3 天
  const due = ddls.filter(d => {
    const end = new Date(d.end); end.setHours(0,0,0,0);
    const t2 = new Date(); t2.setHours(0,0,0,0);
    const days = Math.round((end - t2)/86400000);
    return days >= 0 && days <= 3;
  }).sort((a,b)=>a.end.localeCompare(b.end));
  if (due.length) {
    lines.push('');
    lines.push('⏰ 近 3 天 DDL');
    due.forEach(d => lines.push('  ' + d.end + ' ' + d.name));
  }
  // 今日聚焦
  if (focus.length) {
    lines.push('');
    lines.push('🎯 今日聚焦');
    focus.forEach(f => lines.push('  ' + (f.done ? '✅' : '⬜') + ' ' + f.t));
  }
  const content = lines.join('\n');
  openModal('🌅 ' + (isMorning ? '早安，宝宝' : '你好，宝宝') + ' · 今日简报', [
    { k: 'note', label: '', placeholder: '' }
  ], v => {});
  // 用纯文本填充简报（modal 里显示）
  const fields = document.getElementById('modal-fields');
  fields.innerHTML = '<pre style="white-space:pre-wrap;font-family:var(--mono);font-size:12px;line-height:1.8;color:var(--text);margin:0">' + escapeHtml(content) + '</pre>';
  // 修改确定按钮文字
  const okBtn = document.querySelector('#modal-overlay .btn-primary, #modal-overlay .m-ok');
  if (okBtn) okBtn.textContent = '开始今天';
}
setTimeout(showMorningBrief, 1200);

/* ===== 周回顾（周日晚自动弹） ===== */
function showWeeklyReview() {
  const now = new Date();
  const h = now.getHours();
  // 周日 18-23 点
  if (now.getDay() !== 0 || h < 18 || h > 23) return;
  const wk = store.get('cg_weekly_done', {});
  const key = 'W' + currentWeek();
  if (wk[key]) return;
  // 本周打卡统计
  const tt = store.get('cg_track_today', {});
  const weekStats = [];
  const trackTotal = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    const data = tt[k] || {};
    Object.keys(data).forEach(key2 => {
      trackTotal[key2] = (trackTotal[key2] || 0) + (data[key2] || 0);
    });
  }
  track.forEach(t => {
    weekStats.push(t.name + '：本周 +' + (trackTotal[t.key] || 0) + ' ' + t.unit + '（总 ' + (t.cur||0) + '/' + t.goal + '）');
  });
  if (!weekStats.length) weekStats.push('本周没有打卡记录');
  // 项目状态
  projects.forEach(p => {
    weekStats.push('📁 ' + p.name + '：' + p.status + ' ' + p.progress + '%');
  });
  document.getElementById('wm-stats').value = weekStats.join('\n');
  document.getElementById('weekly-modal').classList.add('open');
}
function saveWeekly() {
  const done = document.getElementById('wm-done').value.trim();
  const next = document.getElementById('wm-next').value.trim();
  const wk = store.get('cg_weekly_done', {});
  wk['W' + currentWeek()] = { done, next, time: new Date().toISOString() };
  store.set('cg_weekly_done', wk);
  document.getElementById('weekly-modal').classList.remove('open');
}
setInterval(() => { const h = new Date().getHours(); if (h === 20 || h === 21) showWeeklyReview(); }, 60000);
setTimeout(showWeeklyReview, 3000);

/* ===== 睡觉提醒（23:30 温和提醒，可关） ===== */
function checkSleepReminder() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  // 23:25 - 23:40 之间，每 5 分钟最多提醒一次
  if (h === 23 && m >= 25 && m <= 40) {
    const today = dateKey();
    const reminded = store.get('cg_sleep_reminded', {});
    if (!reminded[today]) {
      reminded[today] = true;
      store.set('cg_sleep_reminded', reminded);
      openModal('🌙 该休息了，宝宝', [
        { k: 'ok', label: '', placeholder: '' }
      ], v => {});
      const fields = document.getElementById('modal-fields');
      fields.innerHTML = '<div style="font-size:13px;line-height:1.9;color:var(--text-dim);text-align:center">' +
        '现在是 23:30，明天早上还要写代码。<br>' +
        '<b style="color:var(--text)">睡 7 小时 = 6:30 起床</b>，够你上午学完 C 语言第 2 集。<br><br>' +
        '晚安，宝宝 🌙</div>';
      const okBtn = document.querySelector('#modal-overlay .btn-primary, #modal-overlay .m-ok');
      if (okBtn) okBtn.textContent = '好，去睡';
    }
  }
}
setInterval(checkSleepReminder, 60000);
checkSleepReminder();

/* ===== 开始学习：打开对应学习软件 ===== */
function trackStart(key) {
  const d = track.find(x => x.key === key);
  if (!d) return;
  // 网页类追踪项（有 link 且无本地软件）：直接打开网页
  const appMap = { 'c': ['哔哩'], 'py': [], 'lc': [], 'en': ['扇贝'] };
  // 优先用自定义启动配置（支持多软件）
  // 优先：关联工作流 → 批量启动
  if (d.wf && typeof workflows !== 'undefined') {
    const w = workflows.find(x => x.name === d.wf);
    if (w) {
      runWorkflow(workflows.indexOf(w));
      return;
    }
  }
  // 自定义网页（多个用 + 分隔）
  if (d.startUrls && d.startUrls.length) {
    d.startUrls.forEach(u => { if (u) openExternalUrl(u); });
  }
  // 自定义软件 + 默认映射
  const targets = (d.startApps && d.startApps.length) ? d.startApps : (appMap[key] || []);
  let launched = 0;
  if (typeof appLaunchers !== 'undefined' && targets.length) {
    targets.forEach(t => {
      const launcher = appLaunchers.find(a => a.name.includes(t.trim()));
      if (launcher) { launchApp(appLaunchers.indexOf(launcher)); launched++; }
    });
  }
  // 没启动任何软件且没开网页 → 打开默认课程链接
  if (!launched && !(d.startUrls && d.startUrls.length) && d.link) openExternalUrl(d.link);
  if (launched || (d.startUrls && d.startUrls.length)) {
    // 非阻塞提示（不用 alert，避免抢焦点）
    const el = document.getElementById('sb-sync');
    if (el) { el.textContent = '⚡ 已启动 ' + launched + ' 个软件' + ((d.startUrls||[]).length ? ' + ' + (d.startUrls||[]).length + ' 个网页' : ''); el.style.color = 'var(--green)'; setTimeout(() => { if (el.textContent.startsWith('⚡')) { el.textContent = '📱 手机同步已开启'; el.style.color = 'var(--green)'; } }, 3000); }
  }
}

/* ===== 一键记录作息 ===== */
function sleepNow(mode) {
  const now = new Date();
  const hh = pad(now.getHours()), mm = pad(now.getMinutes());
  const time = hh + ':' + mm;
  const today = dateKey();
  sleepLog[today] = sleepLog[today] || {};
  if (mode === 'bed') {
    sleepLog[today].bed = time;
    alert('🌙 已记录：' + time + ' 入睡');
  } else {
    sleepLog[today].wake = time;
    // 如果有 bed 就算时长
    if (sleepLog[today].bed) {
      const [bh,bm] = sleepLog[today].bed.split(':').map(Number);
      const [wh,wm] = time.split(':').map(Number);
      let hours = (wh*60+wm - (bh*60+bm)) / 60;
      if (hours < 0) hours += 24;
      sleepLog[today].hours = Math.round(hours*10)/10;
      alert('☀️ 已记录：' + time + ' 醒来（睡了 ' + sleepLog[today].hours + ' 小时）');
    } else {
      alert('☀️ 已记录：' + time + ' 醒来');
    }
  }
  store.set('cg_sleep', sleepLog);
  renderSleep();
}

/* ===== 离线数据恢复同步 ===== */
function syncOffline() {
  try {
    const q = JSON.parse(localStorage.getItem('cg_offline') || '[]');
    if (!q.length) return;
    // 防止重复推送（推送中标记）
    if (localStorage.getItem('cg_offline_syncing') === '1') return;
    localStorage.setItem('cg_offline_syncing', '1');
    let done = 0;
    const pushNext = (i) => {
      if (i >= q.length) {
        localStorage.setItem('cg_offline', '[]');
        localStorage.removeItem('cg_offline_syncing');
        const el = document.getElementById('sb-sync');
        if (el) { el.textContent = '📱 手机同步已开启'; el.style.color = 'var(--green)'; }
        alert('✅ 已同步 ' + done + ' 条离线操作到电脑');
        return;
      }
      fetch('/api/save', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ key: q[i].k, value: q[i].v }) })
        .then(r => r.json())
        .then(d => { if (d && d.ok === false) throw new Error('fail'); done++; pushNext(i+1); })
        .catch(() => { localStorage.removeItem('cg_offline_syncing'); /* 仍离线，稍后重试 */ });
    };
    pushNext(0);
  } catch(e) {}
}

/* 延迟渲染（确保所有变量已声明） */
try { renderFocus(); } catch(e) {}

/* ===== 错误捕获器（调试用：所有 JS 错误自动记录） ===== */
(function() {
  window.__errLog = [];
  window.onerror = function(msg, src, line, col, err) {
    try {
      window.__errLog.push({ msg: String(msg), line: line, col: col, time: new Date().toLocaleTimeString() });
      if (window.__errLog.length > 50) window.__errLog.shift();
      localStorage.setItem('cg_errlog', JSON.stringify(window.__errLog.slice(-20)));
    } catch(e) {}
  };
  window.addEventListener('unhandledrejection', function(e) {
    try {
      window.__errLog.push({ msg: 'Promise: ' + String(e.reason && e.reason.message ? e.reason.message : e.reason), time: new Date().toLocaleTimeString() });
      localStorage.setItem('cg_errlog', JSON.stringify(window.__errLog.slice(-20)));
    } catch(e2) {}
  });
  // 显示最近错误（状态栏点击可看）
  try {
    const saved = JSON.parse(localStorage.getItem('cg_errlog') || '[]');
    if (saved.length) {
      const el = document.getElementById('sb-sync');
      if (el) { el.title = '最近错误：\n' + saved.map(s => s.time + ' ' + s.msg).join('\n'); }
    }
  } catch(e) {}
})();

/* ===== 打开使用手册 ===== */
function openHelp() {
  const d8 = document.getElementById('d8');
  if (!d8) return;
  // 切换到帮助抽屉
  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.drawer-btn').forEach(b => b.classList.remove('active'));
  d8.classList.add('open');
  const btn = document.querySelector('.drawer-btn[data-drawer="d8"]');
  if (btn) btn.classList.add('active');
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== 打开 Reasonix 编程助手 ===== */
function openReasonix() {
  if (IS_SERVER) {
    fetch('/api/reasonix').catch(()=>{});
    document.getElementById('chat-panel').classList.remove('open');
  } else {
    window.open('http://127.0.0.1:8787/', '_blank');
  }
}


/* ===== 星系核心同步（黑金版） ===== */
(function () {
  function syncCore() {
    const t2 = document.getElementById('deck-time2');
    const d2 = document.getElementById('deck-date2');
    const t1 = document.getElementById('deck-time');
    const d1 = document.getElementById('deck-date');
    if (t2 && t1) t2.textContent = t1.textContent;
    if (d2 && d1) d2.textContent = d1.textContent;
  }
  setInterval(syncCore, 500);
  setTimeout(syncCore, 200);
  function syncFocus() {
    const f2 = document.getElementById('deck-focus2');
    const f1 = document.getElementById('deck-focus');
    if (!f2 || !f1) return;
    const items = f1.querySelectorAll('.deck-focus-item');
    if (!items.length) { f2.innerHTML = ''; return; }
    let out = '';
    const showN = Math.min(2, items.length);
    for (let i = 0; i < showN; i++) {
      const txt = items[i].querySelector('.txt');
      const t = txt ? txt.textContent.trim() : '';
      const done = items[i].classList.contains('done');
      out += '<div class="fc-item' + (done ? ' done' : '') + '" onclick="toggleFocus(' + i + ')" title="点击标记完成/未完成">' +
             '<span class="fc-txt">' + t.slice(0, 12) + '</span>' +
             '<span class="fc-x" onclick="event.stopPropagation();delFocus(' + i + ')" title="删除">✕</span>' +
             '</div>';
    }
    if (items.length > showN) out += '<div class="fc-more" onclick="openDrawer(\'d1\', document.querySelector(\'.dial[data-drawer="d1"]\'))">+' + (items.length - showN) + ' 更多</div>';
    f2.innerHTML = out;
    // 绑定样式
    const style = document.getElementById('fc-style');
    if (!style) {
      const s = document.createElement('style');
      s.id = 'fc-style';
      s.textContent = '.core-focus .fc-item{display:flex;align-items:center;gap:6px;cursor:pointer;}' +
        '.core-focus .fc-item .fc-x{font-size:9px;color:var(--text-faint);opacity:.7;}' +
        '.core-focus .fc-item .fc-x:hover{opacity:1;color:var(--red);}' +
        '.core-focus .fc-item.done .fc-txt{text-decoration:line-through;opacity:.5;}';
      document.head.appendChild(s);
    }
  }
  setInterval(syncFocus, 1500);
  function syncWeather() {
    const w2 = document.getElementById('weather-widget2');
    const w1 = document.getElementById('weather-widget');
    if (w2 && w1 && w1.textContent && w1.textContent.indexOf('LOADING') < 0) {
      const t = w1.textContent.replace(/\s+/g, ' ').trim();
      if (t && t.length > 3) w2.textContent = t.slice(0, 44);
    }
  }
  setInterval(syncWeather, 3000);
  function syncDDL() {
    const cd = document.getElementById('core-ddl');
    const d1 = document.getElementById('deck-ddl');
    if (cd && d1 && d1.innerHTML) cd.innerHTML = d1.innerHTML;
  }
  setInterval(syncDDL, 2000);

  function syncDialCounts() {
    // 学业=待办+追踪, 工作=项目, 对话=消息, 工具=应用, 生活=睡眠/喝水, 知识库=知识, 日记=日记数
    try {
      const t = store.get('cg_todos') || [];
      const p = store.get('cg_projects') || [];
      const j = store.get('cg_journal') || [];
      const s = store.get('cg_splits') || [];
      const nums = {
        'dial-num-1': t.length + (s.length || 0),
        'dial-num-2': p.length,
        'dial-num-3': 'AI',
        'dial-num-4': (store.get('cg_apps') || []).length,
        'dial-num-5': 0,
        'dial-num-6': (store.get('cg_clubs') || []).length + (store.get('cg_courses_v2') || []).length,
        'dial-num-7': j.length
      };
      for (const [id, v] of Object.entries(nums)) {
        const el = document.getElementById(id);
        if (el) el.textContent = v;
      }
    } catch(e) {}
  }
  setInterval(syncDialCounts, 3000);

})();

