const list = document.getElementById('matchList');
list.innerHTML = MATCHES.map(match => `
  <a class="match-card" href="watch.html?id=${match.id}">
    <div class="league">${match.league}</div>
    <div class="match-row">
      <div><img src="${match.homeLogo}" alt="${match.home}"><b>${match.home}</b></div>
      <strong>${match.homeScore} - ${match.awayScore}</strong>
      <div><img src="${match.awayLogo}" alt="${match.away}"><b>${match.away}</b></div>
    </div>
    <div class="meta"><span>${match.time}</span><span class="status">${match.status}</span></div>
  </a>
`).join('');
