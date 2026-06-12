const B79_CONFIG = {
  // Đổi file này thành link API/backend của bạn nếu muốn tự lấy lịch thật:
  // Ví dụ: https://yourdomain.com/api/matches
  matchesUrl: 'matches.json',
  refreshSeconds: 30,
  hideEndedMatches: true,
  timezone: 'Asia/Ho_Chi_Minh'
};

const FALLBACK_MATCHES = [
  {
    id: 'canada-bosnia-2026',
    home: 'Canada',
    away: 'Bosnia & Herzegovina',
    homeScore: 0,
    awayScore: 0,
    startTime: '2026-06-13T02:00:00+07:00',
    endTime: '2026-06-13T04:00:00+07:00',
    league: 'Giao hữu quốc tế',
    homeLogo: 'https://flagcdn.com/w160/ca.png',
    awayLogo: 'https://flagcdn.com/w160/ba.png',
    servers: [
      {
        name: 'OBS HD',
        type: 'hls',
        url: 'https://yourdomain.com/hls/canada-bosnia.m3u8'
      },
      {
        name: 'Demo YouTube',
        type: 'embed',
        url: 'https://www.youtube.com/embed/jfKfPfyJRdk'
      }
    ],
    commentary: [
      'Trận đấu chưa bắt đầu, tín hiệu OBS sẽ có khi bạn bấm Start Streaming.',
      'Nguồn phát nên là video bạn sở hữu hoặc nguồn được cấp phép.'
    ],
    lineup: ['Canada: Đang cập nhật', 'Bosnia & Herzegovina: Đang cập nhật'],
    stats: ['Kiểm soát bóng: 0% - 0%', 'Sút bóng: 0 - 0', 'Phạt góc: 0 - 0'],
    h2h: ['Đang cập nhật dữ liệu đối đầu.']
  }
];

function parseTime(value) {
  const time = new Date(value);
  return Number.isNaN(time.getTime()) ? null : time;
}

function formatMatchTime(match) {
  const start = parseTime(match.startTime);
  if (!start) return match.time || 'Đang cập nhật';
  return start.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: B79_CONFIG.timezone
  });
}

function getMatchStatus(match) {
  const now = new Date();
  const start = parseTime(match.startTime);
  const end = parseTime(match.endTime);

  if (end && now >= end) return { text: 'Đã kết thúc', key: 'ended' };
  if (start && now < start) return { text: 'Sắp diễn ra', key: 'upcoming' };
  return { text: 'Đang phát', key: 'live' };
}

function normalizeMatch(match) {
  const status = getMatchStatus(match);
  return {
    homeScore: 0,
    awayScore: 0,
    homeLogo: 'https://via.placeholder.com/160x100?text=HOME',
    awayLogo: 'https://via.placeholder.com/160x100?text=AWAY',
    servers: [],
    commentary: ['Đang cập nhật diễn biến trận đấu.'],
    lineup: ['Đang cập nhật đội hình.'],
    stats: ['Đang cập nhật thống kê.'],
    h2h: ['Đang cập nhật đối đầu.'],
    ...match,
    time: formatMatchTime(match),
    status: status.text,
    statusKey: status.key
  };
}

async function loadMatches() {
  try {
    const url = `${B79_CONFIG.matchesUrl}?v=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Không tải được lịch đấu');
    const data = await response.json();
    const rawMatches = Array.isArray(data) ? data : (data.matches || []);
    return prepareMatches(rawMatches);
  } catch (error) {
    console.warn('B79 dùng dữ liệu dự phòng:', error.message);
    return prepareMatches(FALLBACK_MATCHES);
  }
}

function prepareMatches(rawMatches) {
  const matches = rawMatches.map(normalizeMatch);
  const visible = B79_CONFIG.hideEndedMatches
    ? matches.filter(match => match.statusKey !== 'ended')
    : matches;

  return visible.sort((a, b) => {
    const ta = parseTime(a.startTime)?.getTime() || 0;
    const tb = parseTime(b.startTime)?.getTime() || 0;
    return ta - tb;
  });
}
