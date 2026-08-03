/* ================================================================
   值得关注项目检查器 (watch_check.js)
   用途：定期检查 watchlist 里项目的星标/更新状态
   运行：node watch_check.js（手动）
   或：定时任务（cron）自动跑
   ================================================================ */
const fs = require('fs');

// 带重试的 fetch（网络波动容错）
async function fetchRetry(url, opts, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }));
      clearTimeout(t);
      return r;
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise(res => setTimeout(res, 2000 * (i + 1)));
    }
  }
}

const path = require('path');

const WATCH_FILE = path.join(__dirname, 'watchlist.md');
const REPOS = [
  { repo: 'johnson7788/AIOffice', name: 'AIOffice' }
];

// GitHub API 限流友好检查
async function checkRepo(repo) {
  try {
    const r = await fetchRetry('https://api.github.com/repos/' + repo, {
      headers: { 'User-Agent': 'watch-check' }
    });
    if (r.status === 403) return { repo, error: 'API 限流' };
    if (r.status === 404) return { repo, error: '仓库不存在' };
    const j = await r.json();
    return {
      repo,
      stars: j.stargazers_count,
      updated: j.updated_at,
      archived: j.archived || false,
      description: (j.description || '').slice(0, 60)
    };
  } catch (e) {
    return { repo, error: e.message };
  }
}

(async () => {
  console.log('=== 值得关注项目检查 ' + new Date().toLocaleString('zh-CN') + ' ===\n');
  for (const item of REPOS) {
    const r = await checkRepo(item.repo);
    if (r.error) {
      console.log(`⚠️ ${item.name}: ${r.error}`);
      continue;
    }
    console.log(`📦 ${item.name} (${r.repo})`);
    console.log(`   星标: ${r.stars} | 最后更新: ${r.updated} | 归档: ${r.archived}`);
    console.log(`   描述: ${r.description}`);
    
    // 达标判断
    if (r.stars >= 100) {
      console.log(`   🎉 达标！星标 ≥100，可以提醒宝宝了！`);
    } else if (r.stars >= 20) {
      console.log(`   📈 有起色（星标 20+），继续观察`);
    } else {
      console.log(`   ⏳ 仍在早期（星标 <20），保持观察`);
    }
    console.log('');
  }
  console.log('=== 检查完毕 ===');
})();
