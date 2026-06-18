const list = document.getElementById('matchList');

const TEAM_VI = {
  Czechia: 'SÉC',
  'South Africa': 'NAM PHI',
  Germany: 'ĐỨC',
  Sweden: 'THỤY ĐIỂN',
  Portugal: 'BỒ ĐÀO NHA',
  'Congo DR': 'CHDC CONGO',
  'DR Congo': 'CHDC CONGO',
  France: 'PHÁP',
  England: 'ANH',
  Japan: 'NHẬT BẢN',
  Brazil: 'BRAZIL',
  Argentina: 'ARGENTINA'
};

function viName(name) {
  return TEAM_VI[name] || name;
}

function scoreOf(m, side) {
  const s = m.score || {};
  return s.fullTime?.[side] ?? s.regularTime?.[side] ?? s.halfTime?.[side] ?? 0;
}

function statusText(status) {
  if (status === 'FINISHED') return 'Kết thúc';
  if (status === 'IN_PLAY') return 'Đang trực tiếp';
  if (status === 'PAUSED') return 'Tạm nghỉ';
  return 'Sắp diễn ra';
}

function statusKey(status) {
  if (status === 'IN_PLAY' || status === 'PAUSED') return 'live';
  if (status === 'FINISHED') return 'finished';
  return 'upcoming';
}

function formatTime(dateText) {
  return new Date(dateText).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function loadApiMatches() {
  const res = await fetch('/api/matches', { cache: 'no-store' });
  const data = await res.json();

  return (data.matches || []).map(m => ({
    id: String(m.id),
    league: m.group ? m.group.replace('GROUP_', 'Bảng ') + ' - World Cup' : 'World Cup',
    home: viName(m.homeTeam.name),
    away: viName(m.awayTeam.name),
    homeLogo: m.homeTeam.crest || '',
    awayLogo: m.awayTeam.crest || '',
    homeScore: scoreOf(m, 'home'),
    awayScore: scoreOf(m, 'away'),
    time: formatTime(m.utcDate),
    status: statusText(m.status),
    statusKey: statusKey(m.status),
    startTime: m.utcDate
  }));
}

function countdownText(match) {
  const start = new Date(match.startTime);
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
      <div class="meta">
        <span>${match.time}</span>
        <span class="status ${match.statusKey}">${countdownText(match)}</span>
      </div>
    </a>
  `).join('');
}

async function refreshMatches() {
  try {
    const matches = await loadApiMatches();
    renderMatches(matches);
  } catch (e) {
    const matches = await loadMatches();
    renderMatches(matches);
  }
}

refreshMatches();
setInterval(refreshMatches, 30000);
setInterval(refreshMatches, 1000);
