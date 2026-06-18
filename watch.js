const params = new URLSearchParams(location.search);
let match = null;
let currentTab = 'commentary';
let hlsInstance = null;

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

async function loadApiMatches() {
  const res = await fetch('/api/matches', { cache: 'no-store' });
  const data = await res.json();

  return (data.matches || []).map(m => ({
    id: String(m.id),
    home: viName(m.homeTeam.name),
    away: viName(m.awayTeam.name),
    homeLogo: m.homeTeam.crest || '',
    awayLogo: m.awayTeam.crest || '',
    homeScore: scoreOf(m, 'home'),
    awayScore: scoreOf(m, 'away'),
    time: new Date(m.utcDate).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }),
    status: m.status === 'FINISHED' ? 'Kết thúc' :
            m.status === 'IN_PLAY' ? 'Đang trực tiếp' :
            m.status === 'PAUSED' ? 'Tạm nghỉ' :
            'Sắp diễn ra',
    statusKey: m.status === 'IN_PLAY' ? 'live' :
               m.status === 'FINISHED' ? 'finished' : 'upcoming',
    servers: [{ name: 'WC LIVE', type: 'embed', url: match?.servers?.[0]?.url || '' }],
    commentary: [
      `${viName(m.homeTeam.name)} vs ${viName(m.awayTeam.name)}`,
      `Trạng thái: ${m.status}`,
      `Cập nhật tự động từ API World Cup`
    ],
    stats: [],
    lineup: []
  }));
}

async function initWatch() {
  let matches = [];

  try {
    matches = await loadApiMatches();
  } catch (e) {
    matches = await loadMatches();
  }

  match = matches.find(m => m.id === params.get('id')) || matches.find(m => m.statusKey === 'live') || matches[0];

  if (!match) {
    document.querySelector('.left-col').innerHTML = '<div class="empty-state">Hiện chưa có trận nào để xem.</div>';
    return;
  }

  renderMatchInfo(matches);
  renderServers();
  renderTab();
  renderChat();

  if (match.servers && match.servers[0]) {
    playServer(match.servers[0]);
  }
}

function renderMatchInfo(matches) {
  document.title = `${match.home} vs ${match.away} - WC LIVE`;

  homeLogo.src = match.homeLogo;
  awayLogo.src = match.awayLogo;
  homeName.textContent = match.home;
  awayName.textContent = match.away;
  homeScore.textContent = match.homeScore;
  awayScore.textContent = match.awayScore;
  matchTime.textContent = `${match.time} • ${match.status}`;
  articleTitle.textContent = `Trực tiếp ${match.home} vs ${match.away}`;

  otherMatches.innerHTML = matches.filter(m => m.id !== match.id).slice(0, 8).map(m => `
    <a class="mini-match" href="watch.html?id=${m.id}">
      <img src="${m.homeLogo}"> ${m.home} vs ${m.away}
      <small>${m.homeScore} - ${m.awayScore} • ${m.time} • ${m.status}</small>
    </a>
  `).join('') || '<p>Không có trận khác.</p>';
}

function renderServers() {
  if (!match.servers || !match.servers.length || !match.servers[0].url) {
    serverButtons.innerHTML = '<span class="server-note">Chưa có link phát.</span>';
    return;
  }

  serverButtons.innerHTML = match.servers.map((s, i) => `
    <button class="server ${i === 0 ? 'active' : ''}" data-index="${i}">${s.name}</button>
  `).join('');

  serverButtons.onclick = e => {
    if (!e.target.classList.contains('server')) return;
    document.querySelectorAll('.server').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    playServer(match.servers[Number(e.target.dataset.index)]);
  };
}

function stopCurrentPlayer() {
  videoFrame.src = '';
  videoFrame.style.display = 'none';
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
  videoPlayer.style.display = 'none';
  videoNotice.textContent = '';

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
}

function playServer(server) {
  stopCurrentPlayer();

  if (!server || !server.url) {
    videoNotice.textContent = 'Chưa có nguồn phát cho trận này.';
    return;
  }

  if (server.type === 'embed') {
    videoFrame.style.display = 'block';
    videoFrame.src = server.url;
    return;
  }

  videoPlayer.style.display = 'block';
  videoPlayer.src = server.url;
}

function renderTab() {
  const data = match[currentTab] || [];
  tabContent.innerHTML = data.map(item => `<p>${item}</p>`).join('');
}

document.querySelectorAll('.tab').forEach(btn => btn.onclick = () => {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentTab = btn.dataset.tab;
  renderTab();
});

function renderChat() {
  chatMessages.innerHTML = '';
}

sendChat.onclick = () => {
  const text = chatInput.value.trim();
  if (!text) return;
  chatMessages.innerHTML += `<div><b>Bạn:</b> ${text}</div>`;
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

initWatch();
setInterval(initWatch, 30000);
