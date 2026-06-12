const params = new URLSearchParams(location.search);
const match = MATCHES.find(m => m.id === params.get('id')) || MATCHES[0];
let currentTab = 'commentary';

document.title = `${match.home} vs ${match.away} - B79 TV`;
homeLogo.src = match.homeLogo; awayLogo.src = match.awayLogo;
homeName.textContent = match.home; awayName.textContent = match.away;
homeScore.textContent = match.homeScore; awayScore.textContent = match.awayScore;
matchTime.textContent = match.time;
articleTitle.textContent = `Trực tiếp ${match.home} vs ${match.away}`;
videoFrame.src = match.servers[0].url;

serverButtons.innerHTML = match.servers.map((s, i) => `<button class="server ${i===0?'active':''}" data-url="${s.url}">${s.name}</button>`).join('');
serverButtons.onclick = e => {
  if (!e.target.classList.contains('server')) return;
  document.querySelectorAll('.server').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  videoFrame.src = e.target.dataset.url;
};

function renderTab() {
  const data = match[currentTab] || [];
  tabContent.innerHTML = data.map(item => `<p>${item}</p>`).join('');
}
renderTab();
document.querySelectorAll('.tab').forEach(btn => btn.onclick = () => {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentTab = btn.dataset.tab;
  renderTab();
});

const demoChats = ['Anh em xem link có mượt không?', 'B79 TV lên hình đẹp quá', 'Dự đoán Canada thắng 2-1'];
chatMessages.innerHTML = demoChats.map(t => `<div><b>Fan:</b> ${t}</div>`).join('');
sendChat.onclick = () => {
  const text = chatInput.value.trim();
  if (!text) return;
  chatMessages.innerHTML += `<div><b>Bạn:</b> ${text}</div>`;
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

otherMatches.innerHTML = MATCHES.filter(m => m.id !== match.id).map(m => `
  <a class="mini-match" href="watch.html?id=${m.id}">
    <img src="${m.homeLogo}"> ${m.home} vs ${m.away}
    <small>${m.time}</small>
  </a>
`).join('');
