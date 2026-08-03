// 彻底排查周回顾弹窗触发
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 找所有 maybeShowReview 相关
console.log('=== maybeShowReview 相关 ===');
let idx = 0, count = 0;
while ((idx = html.indexOf('maybeShowReview', idx)) >= 0 && count < 10) {
  console.log('@' + idx + ': ' + html.slice(idx - 60, idx + 80).replace(/\n/g, ' '));
  idx += 14; count++;
}

// 找 openReview / showReview / review modal
['openReview', 'showReview', 'review-modal', 'id="review"', 'maybeShowWeekly'].forEach(k => {
  let i = html.indexOf(k);
  console.log(k, '→', i >= 0 ? '@' + i + ': ' + html.slice(i - 40, i + 60).replace(/\n/g, ' ') : '❌');
});
