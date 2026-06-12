const list = document.getElementById('matchList');

function countdownText(match) {
  const start = parseTime(match.startTime);
  if (!start || match.statusKey !== 'upcoming') return match.status;

  const diff = start.getTime() - Date.now();
  if (diff <= 0) return 'Đang phát';

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `Còn ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function renderMatches(matches) {
  if (!matches.length) {
    list.innerHTML = `<div class="empty-state">Hiện chưa có trận nào. Trang sẽ tự cập nhật khi có lịch mới.</div>`;
    return;
  }

  list.innerHTML = matches.map(match => `
    <a class="match-card ${match.statusKey}" href="watch.html?id=${match.id}">
      <div class="league">${match.league}</div>
      <div class="match-row">
        <div><img src="${match.homeLogo}" alt="${match.home}"><b>${match.home}</b></div>
        <strong>${match.homeScore} - ${match.awayScore}</strong>
        <div><img src="${match.awayLogo}" alt="${match.away}"><b>${match.away}</b></div>
      </div>
      <div class="meta"><span>${match.time}</span><span class="status ${match.statusKey}">${countdownText(match)}</span></div>
    </a>
  `).join('');
}

async function refreshMatches() {
  const matches = await loadMatches();
  renderMatches(matches);
}

refreshMatches();
setInterval(refreshMatches, B79_CONFIG.refreshSeconds * 1000);
setInterval(async () => renderMatches(await loadMatches()), 1000);
