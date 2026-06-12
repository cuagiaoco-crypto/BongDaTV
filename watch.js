const params = new URLSearchParams(location.search);
let match = null;
let currentTab = 'commentary';
let hlsInstance = null;

async function initWatch() {
  const matches = await loadMatches();
  match = matches.find(m => m.id === params.get('id')) || matches[0];

  if (!match) {
    document.querySelector('.left-col').innerHTML = '<div class="empty-state">Hiện chưa có trận nào để xem.</div>';
    return;
  }

  renderMatchInfo(matches);
  renderServers();
  renderTab();
  renderChat();
  playServer(match.servers[0]);
}

function renderMatchInfo(matches) {
  document.title = `${match.home} vs ${match.away} - B79 TV`;
  homeLogo.src = match.homeLogo;
  awayLogo.src = match.awayLogo;
  homeName.textContent = match.home;
  awayName.textContent = match.away;
  homeScore.textContent = match.homeScore;
  awayScore.textContent = match.awayScore;
  matchTime.textContent = `${match.time} • ${match.status}`;
  articleTitle.textContent = `Trực tiếp ${match.home} vs ${match.away}`;

  otherMatches.innerHTML = matches.filter(m => m.id !== match.id).map(m => `
    <a class="mini-match" href="watch.html?id=${m.id}">
      <img src="${m.homeLogo}"> ${m.home} vs ${m.away}
      <small>${m.time} • ${m.status}</small>
    </a>
  `).join('') || '<p>Không có trận khác.</p>';
}

function renderServers() {
  if (!match.servers.length) {
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

  if (match.statusKey === 'upcoming') {
    videoNotice.textContent = 'Trận chưa bắt đầu. Khi OBS phát, video sẽ tự có tín hiệu.';
  }

  if (server.type === 'embed') {
    videoFrame.style.display = 'block';
    videoFrame.src = server.url;
    return;
  }

  videoPlayer.style.display = 'block';
  if (server.type === 'hls' || server.url.includes('.m3u8')) {
    if (Hls.isSupported()) {
      hlsInstance = new Hls({ liveSyncDurationCount: 3 });
      hlsInstance.loadSource(server.url);
      hlsInstance.attachMedia(videoPlayer);
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
      videoPlayer.src = server.url;
    } else {
      videoNotice.textContent = 'Trình duyệt này chưa hỗ trợ HLS.';
    }
  } else {
    videoPlayer.src = server.url;
  }
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
  const demoChats = ['Anh em xem link có mượt không?', 'B79 TV lên hình đẹp quá', 'Dự đoán trận này hòa 1-1'];
  chatMessages.innerHTML = demoChats.map(t => `<div><b>Fan:</b> ${t}</div>`).join('');
}

sendChat.onclick = () => {
  const text = chatInput.value.trim();
  if (!text) return;
  chatMessages.innerHTML += `<div><b>Bạn:</b> ${text}</div>`;
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

initWatch();
setInterval(initWatch, B79_CONFIG.refreshSeconds * 1000);
