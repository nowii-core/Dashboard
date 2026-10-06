'use strict';

/* =========================================================
   NOWII·ANALYTICS — Dashboard
   ========================================================= */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const STORAGE_KEY = 'nowii_analytics_settings';
const PROFILE_KEY = 'nowii_profile_data';

/* ============ IMPOSTAZIONI ============ */
const DEFAULT_SETTINGS = {
  accent: '#6366f1',
  dark: true,
  animations: true,
  autoRefresh: false
};

let settings = { ...DEFAULT_SETTINGS, ...loadSettings() };

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function applySettings() {
  document.documentElement.style.setProperty('--accent-1', settings.accent);
  document.documentElement.setAttribute('data-theme', settings.dark ? 'dark' : 'light');
  document.documentElement.classList.toggle('no-anim', !settings.animations);
  styleCache = null;
}

/* ============ CACHE STILI ============ */
let styleCache = null;
function getStyleCache() {
  if (styleCache) return styleCache;
  const cs = getComputedStyle(document.body);
  styleCache = {
    text: cs.getPropertyValue('--text').trim() || '#e9e9f2',
    textMuted: cs.getPropertyValue('--text-muted').trim() || '#8d8da6',
    bg2: cs.getPropertyValue('--bg-2').trim() || '#0d0d15',
    accent2: cs.getPropertyValue('--accent-2').trim() || '#22d3ee'
  };
  return styleCache;
}

/* ============ PROFILO DATI ============ */
const DEFAULT_PROFILE = {
  name: 'nowii-core',
  email: 'ciao@nowii-core.dev',
  role: 'Amministratore',
  bio: '',
  avatarColor: 'linear-gradient(135deg,#6366f1,#22d3ee)',
  notif: { email: true, push: false, payments: true, reports: true, marketing: false },
  security: { twoFA: false }
};

let profileData = { ...DEFAULT_PROFILE, ...loadProfile() };

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch { return {}; }
}
function saveProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
}

function applyProfile() {
  const avatar = $('#profileAvatar');
  const name = $('#profileName');
  const email = $('#profileEmail');
  const role = $('#profileRole');

  if (avatar) avatar.style.background = profileData.avatarColor;
  if (name) name.textContent = profileData.name;
  if (email) email.textContent = profileData.email;
  if (role) role.textContent = profileData.role;

  const sideAvatar = document.querySelector('.user-card .avatar');
  const sideName = document.querySelector('.user-meta strong');
  if (sideAvatar) sideAvatar.style.background = profileData.avatarColor;
  if (sideName) sideName.textContent = profileData.name;
}

/* ============ DATI ============ */
const NAMES = [
  'Marco Rossi','Giulia Bianchi','Luca Ferrari','Sofia Romano','Alex Conti',
  'Elena Greco','Davide Riva','Sara Marchetti','Andrea De Luca','Marta Esposito',
  'Paolo Gallo','Chiara Fontana','Simone Costa','Alice Ricci','Matteo Barbieri',
  'Emma Vitale','Leonardo Serra','Beatrice Caruso','Riccardo Lombardi','Valentina Rizzo'
];
const CITIES = ['Milano','Roma','Torino','Napoli','Firenze','Bologna','Venezia','Palermo','Genova','Bari'];
const METHODS = ['Carta','PayPal','Bonifico','Crypto','Apple Pay','Google Pay'];
const STATUSES = ['completed','completed','completed','pending','failed'];
const AVATAR_COLORS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#22d3ee,#0ea5e9)',
  'linear-gradient(135deg,#22c55e,#10b981)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#06b6d4,#6366f1)',
  'linear-gradient(135deg,#a855f7,#ec4899)',
  'linear-gradient(135deg,#14b8a6,#22c55e)'
];

let TRANSACTIONS = [];
let NOTIFICATIONS = [];
let state = { range: 30, chartType: 'line', view: 'dashboard' };

/* ============ UTILITÀ ============ */
function randomFrom(a) { return a[Math.floor(Math.random() * a.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function initials(n) { return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fmtCurrency(n) { return '€' + n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(d) { return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }); }
function fmtTime(d) { return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); }
function lockScroll(lock) { document.body.style.overflow = lock ? 'hidden' : ''; }

/* ============ GENERAZIONE DATI ============ */
function generateTransaction(ageDays = 30) {
  const name = randomFrom(NAMES);
  const daysAgo = randomInt(0, ageDays);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59));

  const id = 'TX-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const amount = randomInt(20, 980) + Math.random();

  return {
    id, name,
    initials: initials(name),
    avatarColor: randomFrom(AVATAR_COLORS),
    email: name.toLowerCase().replace(' ', '.') + '@' + randomFrom(['gmail.com','outlook.com','proton.me','yahoo.com']),
    city: randomFrom(CITIES),
    date,
    method: randomFrom(METHODS),
    status: randomFrom(STATUSES),
    amount: Math.round(amount * 100) / 100
  };
}

function generateData(rangeDays = 30) {
  TRANSACTIONS = Array.from({ length: 120 }, () => generateTransaction(rangeDays));
  TRANSACTIONS.sort((a, b) => b.date - a.date);
}

function generateNotifications() {
  NOTIFICATIONS = [
    { icon: 'success', title: 'Nuovo pagamento ricevuto', body: 'Marco Rossi ha pagato €248,00', time: new Date(Date.now() - 2 * 60000), read: false },
    { icon: 'warning', title: 'Transazione in attesa', body: 'Verifica manuale richiesta per TX-A7C3D1', time: new Date(Date.now() - 18 * 60000), read: false },
    { icon: 'info', title: 'Report mensile pronto', body: 'Il riepilogo di Ottobre è disponibile', time: new Date(Date.now() - 3 * 3600000), read: false },
    { icon: 'success', title: 'Backup completato', body: 'I dati sono stati salvati correttamente', time: new Date(Date.now() - 26 * 3600000), read: true }
  ];
}

/* ============ TOAST ============ */
function showToast(text, type = 'info') {
  const container = $('#toastContainer');
  const iconSvg = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
  }[type] || '';

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${iconSvg}</span><span>${escapeHtml(text)}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

/* ============ LOADING HELPER ============ */
function withLoading(btn, label, fn) {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span>${label}`;
  Promise.resolve(fn()).finally(() => {
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = original;
    }, 400);
  });
}

/* ============ ANIMAZIONE NUMERI ============ */
function animateNumber(el, endStr, duration = 900) {
  const match = endStr.match(/([€$]?)(\s?)([\d.,]+)(.*)/);
  if (!match) { el.textContent = endStr; return; }

  const prefix = match[1] + match[2];
  const numStr = match[3];
  const suffix = match[4];
  const hasComma = numStr.includes(',');

  const raw = parseFloat(numStr.replace(/\./g, '').replace(',', '.')) || 0;
  const start = performance.now();

  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const current = raw * eased;

    let display;
    if (hasComma) {
      display = current.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      display = Math.round(current).toLocaleString('it-IT');
    }
    el.textContent = prefix + display + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ============ LIVE CLOCK ============ */
function tickClock() {
  const el = $('#liveClock');
  if (el) el.textContent = new Date().toLocaleTimeString('it-IT');
}
setInterval(() => {
  if (!document.hidden) tickClock();
}, 1000);
tickClock();

/* ============ KPI ============ */
const KPI_ICONS = {
  revenue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  conversion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
  average: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-4 4 4 5-6"/></svg>'
};

function computeKPIs() {
  const filtered = filterByRange(TRANSACTIONS);
  const completed = filtered.filter(t => t.status === 'completed');
  const revenue = completed.reduce((s, t) => s + t.amount, 0);
  const users = new Set(filtered.map(t => t.name)).size;
  const avgTicket = completed.length ? revenue / completed.length : 0;

  return [
    { label: 'Entrate', icon: 'revenue', value: fmtCurrency(revenue), delta: '+12.4%', trend: 'up' },
    { label: 'Utenti attivi', icon: 'users', value: users.toString(), delta: '+8.1%', trend: 'up' },
    { label: 'Conversion rate', icon: 'conversion', value: (3.2 + Math.random() * 0.8).toFixed(2) + '%', delta: '-0.4%', trend: 'down' },
    { label: 'Ticket medio', icon: 'average', value: fmtCurrency(avgTicket), delta: '+2.3%', trend: 'up' }
  ];
}

function renderKPIs() {
  const container = $('#kpis');
  const kpis = computeKPIs();
  container.innerHTML = kpis.map((k, i) => `
    <div class="kpi" style="animation: viewIn .5s var(--ease) ${i * 80}ms backwards">
      <div class="kpi-label">${KPI_ICONS[k.icon]}${k.label}</div>
      <div class="kpi-value" data-value="${escapeHtml(k.value)}"></div>
      <span class="kpi-delta ${k.trend}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
          ${k.trend === 'up' ? '<path d="M7 17L17 7M17 7h-8M17 7v8"/>' : '<path d="M7 7l10 10M17 17h-8M17 17V9"/>'}
        </svg>
        ${k.delta}
      </span>
    </div>
  `).join('');

  // Count-up
  $$('.kpi-value').forEach(el => {
    animateNumber(el, el.dataset.value);
  });

  $$('.kpi').forEach(kpi => {
    kpi.addEventListener('pointermove', e => {
      const r = kpi.getBoundingClientRect();
      kpi.style.setProperty('--mx', `${e.clientX - r.left}px`);
      kpi.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    kpi.addEventListener('click', () => {
      showToast(`Dettaglio ${kpi.querySelector('.kpi-label').textContent.trim()} in arrivo`, 'info');
    });
  });
}

function filterByRange(list) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - state.range);
  return list.filter(t => t.date >= cutoff);
}

/* ============ CHART PRINCIPALE ============ */
function generateRevenueSeries(days) {
  const groups = Math.min(days, 30);
  const series = [];
  let base = 3200;
  for (let i = 0; i < groups; i++) {
    base += randomInt(-280, 620);
    base = Math.max(1400, Math.min(6200, base));
    series.push({ label: `D${i + 1}`, value: base });
  }
  return series;
}

function drawMainChart() {
  const canvas = $('#mainChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = rect.width;
  const H = rect.height;
  const P = { top: 20, right: 20, bottom: 32, left: 52 };

  ctx.clearRect(0, 0, W, H);

  const data = generateRevenueSeries(state.range);
  const maxV = Math.max(...data.map(d => d.value)) * 1.15;
  const minV = Math.min(...data.map(d => d.value)) * 0.85;

  const chartW = W - P.left - P.right;
  const chartH = H - P.top - P.bottom;
  const steps = 4;
  const styles = getStyleCache();

  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = styles.textMuted;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(255,255,255,.05)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= steps; i++) {
    const y = P.top + (chartH / steps) * i;
    ctx.beginPath();
    ctx.moveTo(P.left, y);
    ctx.lineTo(W - P.right, y);
    ctx.stroke();

    const v = maxV - ((maxV - minV) / steps) * i;
    ctx.fillText('€' + Math.round(v).toLocaleString('it-IT'), P.left - 8, y);
  }

  const points = data.map((d, i) => ({
    x: P.left + (chartW / (data.length - 1)) * i,
    y: P.top + chartH - ((d.value - minV) / (maxV - minV)) * chartH,
    value: d.value
  }));

  const accent1 = settings.accent;
  const accent2 = styles.accent2;

  if (state.chartType === 'bar') {
    const bw = Math.max(4, (chartW / data.length) * 0.65);
    points.forEach((p, i) => {
      const x = P.left + (chartW / data.length) * i + (chartW / data.length - bw) / 2;
      const g = ctx.createLinearGradient(0, p.y, 0, P.top + chartH);
      g.addColorStop(0, accent1);
      g.addColorStop(1, accent2);
      ctx.fillStyle = g;
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(x + r, p.y);
      ctx.arcTo(x + bw, p.y, x + bw, p.y + r, r);
      ctx.lineTo(x + bw, P.top + chartH);
      ctx.lineTo(x, P.top + chartH);
      ctx.lineTo(x, p.y + r);
      ctx.arcTo(x, p.y, x + r, p.y, r);
      ctx.closePath();
      ctx.fill();
    });
  } else {
    if (state.chartType === 'area') {
      const g = ctx.createLinearGradient(0, P.top, 0, P.top + chartH);
      g.addColorStop(0, hexToRgba(accent1, .35));
      g.addColorStop(1, hexToRgba(accent1, 0));
      ctx.beginPath();
      ctx.moveTo(points[0].x, P.top + chartH);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, P.top + chartH);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
    }

    const lineG = ctx.createLinearGradient(P.left, 0, W - P.right, 0);
    lineG.addColorStop(0, accent1);
    lineG.addColorStop(1, accent2);
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = lineG;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = styles.bg2;
      ctx.fill();
      ctx.strokeStyle = accent2;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const delta = ((last - first) / first) * 100;
  const tag = $('#revenueTag');
  tag.textContent = (delta >= 0 ? '+' : '') + delta.toFixed(1) + '%';
  tag.style.background = delta >= 0
    ? 'color-mix(in srgb, var(--success) 15%, transparent)'
    : 'color-mix(in srgb, var(--danger) 15%, transparent)';
  tag.style.color = delta >= 0 ? 'var(--success)' : 'var(--danger)';

  $('#revenueSub').textContent = `Ultimi ${state.range} giorni`;

  // Espone punti per il tooltip
  window._lastChartPoints = points;
}

function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ============ TOOLTIP GRAFICO ============ */
(function initChartTooltip() {
  const canvas = document.getElementById('mainChart');
  if (!canvas) return;

  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);

  canvas.addEventListener('pointermove', (e) => {
    const points = window._lastChartPoints;
    if (!points || !points.length) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let closest = null;
    let minDist = 40;
    points.forEach(p => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < minDist) { minDist = d; closest = p; }
    });

    if (closest) {
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top  = (e.clientY - 10) + 'px';
      tooltip.textContent = '€' + Math.round(closest.value).toLocaleString('it-IT');
    } else {
      tooltip.style.display = 'none';
    }
  });

  canvas.addEventListener('pointerleave', () => {
    tooltip.style.display = 'none';
  });
})();

/* ============ DONUT ============ */
const DONUT_DATA = [
  { label: 'Desktop', value: 52, color: '#6366f1' },
  { label: 'Mobile',  value: 34, color: '#22d3ee' },
  { label: 'Tablet',  value: 14, color: '#a855f7' }
];

function drawDonut() {
  const canvas = $('#donutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = rect.width, H = rect.height;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) / 2 - 20;
  const ir = r * 0.65;

  ctx.clearRect(0, 0, W, H);

  const total = DONUT_DATA.reduce((s, d) => s + d.value, 0);
  let start = -Math.PI / 2;
  DONUT_DATA.forEach(slice => {
    const a = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + a);
    ctx.arc(cx, cy, ir, start + a, start, true);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    start += a;
  });

  const styles = getStyleCache();

  ctx.beginPath();
  ctx.arc(cx, cy, ir, 0, Math.PI * 2);
  ctx.fillStyle = styles.bg2;
  ctx.fill();

  ctx.fillStyle = styles.text;
  ctx.font = 'bold 24px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('100%', cx, cy - 4);

  ctx.fillStyle = styles.textMuted;
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText('Visitatori', cx, cy + 18);
}

function renderLegend() {
  const el = $('#donutLegend');
  el.innerHTML = DONUT_DATA.map(d => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${d.color}"></span>
      <span class="legend-label">${d.label}</span>
      <span class="legend-value">${d.value}%</span>
    </div>
  `).join('');
}

/* ============ TRANSAZIONI ============ */
function renderTransactions() {
  const tbody = $('#transactionsBody');
  const recent = TRANSACTIONS.slice(0, 6);
  tbody.innerHTML = recent.map((t, i) => `
    <tr data-id="${t.id}" style="animation: viewIn .4s var(--ease) ${i * 50}ms backwards">
      <td class="tx-id">${t.id}</td>
      <td>
        <div class="customer">
          <span class="avatar" style="background:${t.avatarColor}">${t.initials}</span>
          <div>
            <div>${escapeHtml(t.name)}</div>
            <small style="color:var(--text-muted);font-size:.72rem">${escapeHtml(t.city)}</small>
          </div>
        </div>
      </td>
      <td>${fmtDate(t.date)} · ${fmtTime(t.date)}</td>
      <td>${escapeHtml(t.method)}</td>
      <td><span class="status ${t.status}">${statusLabel(t.status)}</span></td>
      <td style="text-align:right" class="amount positive">+${fmtCurrency(t.amount)}</td>
    </tr>
  `).join('');

  $$('#transactionsBody tr').forEach(row => {
    row.addEventListener('click', () => openDetail(row.dataset.id));
  });
}

function statusLabel(s) {
  return s === 'completed' ? 'Completato' : s === 'pending' ? 'In attesa' : 'Fallito';
}

/* ============ USERS VIEW ============ */
function renderUsers() {
  const tbody = $('#usersBody');
  const users = Array.from(new Map(TRANSACTIONS.map(t => [t.name, t])).values()).slice(0, 12);
  $('#usersCount').textContent = `${users.length} utenti`;

  tbody.innerHTML = users.map((u, i) => {
    const lastSeen = new Date(Date.now() - randomInt(0, 72) * 3600000);
    const active = Math.random() > 0.3;
    return `
      <tr style="animation: viewIn .4s var(--ease) ${i * 40}ms backwards">
        <td>
          <div class="customer">
            <span class="avatar" style="background:${u.avatarColor}">${u.initials}</span>
            <div>${escapeHtml(u.name)}</div>
          </div>
        </td>
        <td style="color:var(--text-muted);font-size:.82rem">${escapeHtml(u.email)}</td>
        <td>${Math.random() > 0.85 ? 'Admin' : 'Utente'}</td>
        <td>${fmtDate(lastSeen)} · ${fmtTime(lastSeen)}</td>
        <td><span class="status ${active ? 'completed' : 'pending'}">${active ? 'Attivo' : 'Inattivo'}</span></td>
      </tr>
    `;
  }).join('');
}

/* ============ NOTIFICHE ============ */
function renderNotifications() {
  const list = $('#notifList');
  list.innerHTML = NOTIFICATIONS.map((n, i) => {
    const iconSvg = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    }[n.icon];

    return `
      <li class="notif ${n.read ? '' : 'unread'}" data-i="${i}">
        <span class="notif-icon ${n.icon}">${iconSvg}</span>
        <div class="notif-body">
          <strong>${escapeHtml(n.title)}</strong>
          <small>${escapeHtml(n.body)} · ${timeAgo(n.time)}</small>
        </div>
      </li>
    `;
  }).join('');

  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;
  const badge = $('#notifBadge');
  badge.textContent = unreadCount;
  badge.style.display = unreadCount ? 'grid' : 'none';

  $$('.notif').forEach(el => {
    el.addEventListener('click', () => {
      const i = Number(el.dataset.i);
      NOTIFICATIONS[i].read = true;
      renderNotifications();
      showToast('Notifica letta', 'info');
    });
  });
}

function timeAgo(date) {
  const diff = (Date.now() - date) / 1000;
  if (diff < 60) return 'ora';
  if (diff < 3600) return Math.floor(diff / 60) + ' min fa';
  if (diff < 86400) return Math.floor(diff / 3600) + ' h fa';
  return Math.floor(diff / 86400) + ' g fa';
}

/* ============ MODAL TRANSAZIONI ============ */
let modalFilter = { search: '', status: '' };

function openModal() {
  $('#modalBackdrop').classList.add('open');
  renderModalTransactions();
}
function closeModal() {
  $('#modalBackdrop').classList.remove('open');
}
function renderModalTransactions() {
  const tbody = $('#modalBody');
  let list = TRANSACTIONS;

  if (modalFilter.search) {
    const q = modalFilter.search.toLowerCase();
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.method.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q)
    );
  }
  if (modalFilter.status) list = list.filter(t => t.status === modalFilter.status);

  $('#modalSub').textContent = `${list.length} risultati`;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nessuna transazione trovata</td></tr>`;
    return;
  }

  tbody.innerHTML = list.slice(0, 100).map(t => `
    <tr data-id="${t.id}">
      <td class="tx-id">${t.id}</td>
      <td>
        <div class="customer">
          <span class="avatar" style="background:${t.avatarColor}">${t.initials}</span>
          <div>${escapeHtml(t.name)}</div>
        </div>
      </td>
      <td>${fmtDate(t.date)}</td>
      <td>${escapeHtml(t.method)}</td>
      <td><span class="status ${t.status}">${statusLabel(t.status)}</span></td>
      <td style="text-align:right" class="amount positive">+${fmtCurrency(t.amount)}</td>
    </tr>
  `).join('');

  $$('#modalBody tr').forEach(row => {
    row.addEventListener('click', () => {
      closeModal();
      setTimeout(() => openDetail(row.dataset.id), 200);
    });
  });
}

/* ============ MODAL DETTAGLIO ============ */
function openDetail(id) {
  const t = TRANSACTIONS.find(x => x.id === id);
  if (!t) return;

  $('#detailBody').innerHTML = `
    <div class="detail-row"><span class="detail-label">ID transazione</span><span class="detail-value">${t.id}</span></div>
    <div class="detail-row"><span class="detail-label">Cliente</span><span class="detail-value">${escapeHtml(t.name)}</span></div>
    <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value" style="font-size:.8rem">${escapeHtml(t.email)}</span></div>
    <div class="detail-row"><span class="detail-label">Città</span><span class="detail-value">${escapeHtml(t.city)}</span></div>
    <div class="detail-row"><span class="detail-label">Data</span><span class="detail-value">${fmtDate(t.date)} · ${fmtTime(t.date)}</span></div>
    <div class="detail-row"><span class="detail-label">Metodo</span><span class="detail-value">${escapeHtml(t.method)}</span></div>
    <div class="detail-row"><span class="detail-label">Stato</span><span class="status ${t.status}">${statusLabel(t.status)}</span></div>
    <div class="detail-row"><span class="detail-label">Importo</span><span class="detail-value amount positive">+${fmtCurrency(t.amount)}</span></div>
  `;
  $('#detailBackdrop').classList.add('open');
}

/* ============ PROFILO ============ */
function openProfile() {
  const completed = TRANSACTIONS.filter(t => t.status === 'completed');
  const total = completed.reduce((s, t) => s + t.amount, 0);

  $('#profileTxCount').textContent = TRANSACTIONS.length;
  $('#profileTotalRevenue').textContent =
    total >= 1000 ? '€' + (total / 1000).toFixed(1) + 'k' : '€' + total.toFixed(0);

  applyProfile();
  showProfilePanel('menu');
  $('#profileBackdrop').classList.add('open');

  setTimeout(() => {
    const first = $('#profileBackdrop').querySelector('button:not([hidden])');
    if (first) first.focus();
  }, 100);
}

function showProfilePanel(name) {
  $('#profileViewMenu').hidden = (name !== 'menu');
  $('#panelAccount').hidden = (name !== 'account');
  $('#panelNotifications').hidden = (name !== 'notifications');
  $('#panelSecurity').hidden = (name !== 'security');
  $('#profileBack').hidden = (name === 'menu');

  if (name === 'account') initAccountPanel();
  if (name === 'notifications') initNotificationsPanel();
  if (name === 'security') initSecurityPanel();

  const modal = $('.modal-profile');
  if (modal) modal.scrollTop = 0;
}

let editingProfile = null;

function initAccountPanel() {
  editingProfile = JSON.parse(JSON.stringify(profileData));

  $('#accName').value = editingProfile.name;
  $('#accEmail').value = editingProfile.email;
  $('#accBio').value = editingProfile.bio || '';
  $('#accBioCount').textContent = (editingProfile.bio || '').length;

  $$('#avatarColors .avatar-color').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.c === editingProfile.avatarColor);
    btn.onclick = () => {
      editingProfile.avatarColor = btn.dataset.c;
      $$('#avatarColors .avatar-color').forEach(b => b.classList.toggle('active', b === btn));
    };
  });

  $('#accBio').oninput = (e) => {
    $('#accBioCount').textContent = e.target.value.length;
  };
}

function initNotificationsPanel() {
  $('#notifEmail').checked = profileData.notif.email;
  $('#notifPush').checked = profileData.notif.push;
  $('#notifPayments').checked = profileData.notif.payments;
  $('#notifReports').checked = profileData.notif.reports;
  $('#notifMarketing').checked = profileData.notif.marketing;

  const map = {
    notifEmail: 'email',
    notifPush: 'push',
    notifPayments: 'payments',
    notifReports: 'reports',
    notifMarketing: 'marketing'
  };
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.onchange = () => {
      profileData.notif[key] = el.checked;
      saveProfile();
      showToast('Preferenza aggiornata', 'success');
    };
  });
}

function initSecurityPanel() {
  $('#secOld').value = '';
  $('#secNew').value = '';
  $('#secConfirm').value = '';
  $('#pwdStrengthBar').style.width = '0';
  $('#pwdStrengthText').textContent = 'Forza: —';
  $('#sec2FA').checked = profileData.security.twoFA;

  $('#sec2FA').onchange = (e) => {
    profileData.security.twoFA = e.target.checked;
    saveProfile();
    showToast(`2FA ${e.target.checked ? 'attivato' : 'disattivato'}`, e.target.checked ? 'success' : 'warning');
  };

  $('#secNew').oninput = (e) => {
    const res = checkPasswordStrength(e.target.value);
    $('#pwdStrengthBar').style.width = res.width;
    $('#pwdStrengthBar').style.background = res.color;
    $('#pwdStrengthText').textContent = 'Forza: ' + res.label;
  };

  $$('.session-revoke').forEach(btn => {
    btn.onclick = () => {
      btn.closest('.session').style.opacity = '.4';
      btn.textContent = 'Terminata';
      btn.disabled = true;
      showToast('Sessione terminata', 'warning');
    };
  });
}

function checkPasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    { label: '—',           width: '0%',   color: 'transparent' },
    { label: 'Molto debole', width: '20%',  color: 'var(--danger)' },
    { label: 'Debole',      width: '40%',  color: '#f97316' },
    { label: 'Media',       width: '60%',  color: '#eab308' },
    { label: 'Forte',       width: '80%',  color: '#84cc16' },
    { label: 'Molto forte', width: '100%', color: 'var(--success)' }
  ];
  return levels[Math.min(score, 5)];
}

/* ============ EXPORT CSV ============ */
function exportCSV() {
  const list = filterByRange(TRANSACTIONS);
  const header = ['ID', 'Nome', 'Email', 'Città', 'Data', 'Metodo', 'Stato', 'Importo'];
  const rows = list.map(t => [t.id, t.name, t.email, t.city, t.date.toISOString(), t.method, t.status, t.amount.toFixed(2)]);

  const csv = [header, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transazioni-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ============ REFRESH ============ */
function refreshData(silent = false) {
  if (!silent) showToast('Aggiornamento dati…', 'info');
  generateData(state.range);
  generateNotifications();

  [...$$('.table-card'), $('#kpis'), $('.charts')].forEach(el => {
    if (!el) return;
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 700);
  });

  setTimeout(() => {
    renderKPIs();
    renderTransactions();
    renderLegend();
    drawMainChart();
    drawDonut();
    if (state.view === 'users') renderUsers();
    updatePageSubtitle();
  }, 250);
}

/* ============ VIEW SWITCHER ============ */
function updatePageSubtitle() {
  const titles = {
    dashboard: 'Panoramica delle metriche',
    analytics: 'Approfondimenti e funnel',
    users: 'Gestione utenti registrati',
    settings: 'Personalizza la tua esperienza'
  };
  const now = new Date().toLocaleTimeString('it-IT');
  $('#pageSubtitle').innerHTML = `${titles[state.view]} · Ultimo agg. ${now} · <span id="liveClock">${now}</span>`;
}

function switchView(view) {
  state.view = view;
  localStorage.setItem('nowii_view', view);

  $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));

  const titles = {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    users: 'Utenti',
    settings: 'Impostazioni'
  };
  $('#pageTitle').textContent = titles[view];
  updatePageSubtitle();

  if (view === 'dashboard') {
    requestAnimationFrame(() => {
      drawMainChart();
      drawDonut();
    });
  }
  if (view === 'users') renderUsers();
}

/* ============ SETTINGS ============ */
function renderColorPicker() {
  $$('.color-swatch').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.color === settings.accent);
  });
}
function bindSettings() {
  $$('.color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      settings.accent = sw.dataset.color;
      saveSettings();
      applySettings();
      renderColorPicker();
      drawMainChart();
      showToast('Colore aggiornato', 'success');
    });
  });

  $('#darkToggle').checked = settings.dark;
  $('#darkToggle').addEventListener('change', (e) => {
    settings.dark = e.target.checked;
    saveSettings();
    applySettings();
    setTimeout(() => { drawMainChart(); drawDonut(); }, 100);
  });

  $('#animToggle').checked = settings.animations;
  $('#animToggle').addEventListener('change', (e) => {
    settings.animations = e.target.checked;
    saveSettings();
    applySettings();
    showToast(`Animazioni ${settings.animations ? 'attivate' : 'disattivate'}`, 'info');
  });

  $('#autoRefresh').checked = settings.autoRefresh;
  let autoTimer = null;
  function setupAuto() {
    if (autoTimer) clearInterval(autoTimer);
    if (settings.autoRefresh) {
      autoTimer = setInterval(() => {
        if (!document.hidden) refreshData(true);
      }, 30000);
    }
  }
  $('#autoRefresh').addEventListener('change', (e) => {
    settings.autoRefresh = e.target.checked;
    saveSettings();
    setupAuto();
    showToast(`Auto-refresh ${settings.autoRefresh ? 'attivato' : 'disattivato'}`, 'info');
  });
  setupAuto();

  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Vuoi ripristinare le impostazioni di default?')) return;
    withLoading($('#resetBtn'), 'Reset…', async () => {
      settings = { ...DEFAULT_SETTINGS };
      saveSettings();
      applySettings();
      $('#darkToggle').checked = settings.dark;
      $('#animToggle').checked = settings.animations;
      $('#autoRefresh').checked = settings.autoRefresh;
      renderColorPicker();
      await new Promise(r => setTimeout(r, 300));
      drawMainChart();
      drawDonut();
      showToast('Impostazioni ripristinate', 'success');
    });
  });
}

/* ============ SCROLL LOCK GLOBALE ============ */
function bindModalScrollLock() {
  const modals = ['#modalBackdrop', '#detailBackdrop', '#profileBackdrop'];
  const observer = new MutationObserver(() => {
    const anyOpen = modals.some(sel => $(sel).classList.contains('open'));
    lockScroll(anyOpen);
  });
  modals.forEach(sel => {
    const el = $(sel);
    if (el) observer.observe(el, { attributes: true, attributeFilter: ['class'] });
  });
}

/* ============ FOCUS TRAP ============ */
function bindFocusTrap() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const modal = $('.modal-backdrop.open');
    if (!modal) return;
    const focusables = modal.querySelectorAll('button:not([hidden]):not([disabled]), [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
}

/* ============ EVENTI GLOBALI ============ */
function bindEvents() {
  // NAV
  $$('.nav-item').forEach(n => {
    n.addEventListener('click', () => switchView(n.dataset.view));
  });

  // RANGE
  $$('.range-btn').forEach(b => {
    b.addEventListener('click', () => {
      state.range = Number(b.dataset.range);
      localStorage.setItem('nowii_range', state.range);
      $$('.range-btn').forEach(x => x.classList.toggle('active', x === b));
      refreshData(true);
    });
  });

  // CHART TYPE
  $$('.ct-btn').forEach(b => {
    b.addEventListener('click', () => {
      state.chartType = b.dataset.chart;
      $$('.ct-btn').forEach(x => x.classList.toggle('active', x === b));
      drawMainChart();
    });
  });

  // REFRESH
  const refreshBtn = $('#refreshBtn');
  refreshBtn.addEventListener('click', () => {
    refreshBtn.classList.add('spinning');
    setTimeout(() => refreshBtn.classList.remove('spinning'), 900);
    refreshData();
  });

  // EXPORT
  $('#exportBtn').addEventListener('click', () => {
    withLoading($('#exportBtn'), 'Esporto…', async () => {
      await new Promise(r => setTimeout(r, 400));
      exportCSV();
      showToast('File CSV esportato', 'success');
    });
  });

  // NOTIFICHE
  const notifBtn = $('#notifBtn');
  const notifDropdown = $('#notifDropdown');
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
      notifDropdown.classList.remove('open');
    }
  });
  $('#markRead').addEventListener('click', () => {
    NOTIFICATIONS.forEach(n => n.read = true);
    renderNotifications();
    showToast('Tutte le notifiche lette', 'success');
  });

  // USER CARD → apre profilo
  $('#userCard').addEventListener('click', openProfile);

  // MODAL PROFILO — chiusura
  const profileBackdrop = $('#profileBackdrop');
  $('#profileClose').addEventListener('click', () => {
    profileBackdrop.classList.remove('open');
    setTimeout(() => showProfilePanel('menu'), 300);
  });
  profileBackdrop.addEventListener('click', (e) => {
    if (e.target === profileBackdrop) {
      profileBackdrop.classList.remove('open');
      setTimeout(() => showProfilePanel('menu'), 300);
    }
  });

  // Bottone indietro
  $('#profileBack').addEventListener('click', () => showProfilePanel('menu'));

  // Bottoni annulla
  $$('[data-panel-cancel]').forEach(btn => {
    btn.addEventListener('click', () => showProfilePanel('menu'));
  });

  // Menu items
  $$('.profile-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.panel) {
        showProfilePanel(item.dataset.panel.toLowerCase());
        return;
      }

      const action = item.dataset.action;

      if (action === 'logout') {
        if (confirm('Vuoi uscire dall\'account?')) {
          showToast('Logout effettuato (demo)', 'warning');
          setTimeout(() => {
            profileBackdrop.classList.remove('open');
            setTimeout(() => showProfilePanel('menu'), 300);
            refreshData(true);
          }, 700);
        }
        return;
      }

      if (action === 'settings') {
        profileBackdrop.classList.remove('open');
        setTimeout(() => {
          showProfilePanel('menu');
          switchView('settings');
        }, 250);
        return;
      }
    });
  });

  // SALVA ACCOUNT
  $('#saveAccount').addEventListener('click', () => {
    const name = $('#accName').value.trim();
    const email = $('#accEmail').value.trim();
    const bio = $('#accBio').value.trim();

    if (!name || name.length < 2) { showToast('Nome troppo corto', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Email non valida', 'error'); return; }

    withLoading($('#saveAccount'), 'Salvo…', async () => {
      await new Promise(r => setTimeout(r, 400));
      profileData = {
        ...profileData,
        name,
        email,
        bio,
        avatarColor: editingProfile.avatarColor
      };
      saveProfile();
      applyProfile();
      showToast('Profilo aggiornato', 'success');
      showProfilePanel('menu');
    });
  });

  // SALVA SICUREZZA
  $('#saveSecurity').addEventListener('click', () => {
    const oldPwd = $('#secOld').value;
    const newPwd = $('#secNew').value;
    const confirmPwd = $('#secConfirm').value;

    if (!oldPwd) { showToast('Inserisci la password attuale', 'error'); return; }
    if (newPwd.length < 8) { showToast('La nuova password deve avere almeno 8 caratteri', 'error'); return; }
    if (newPwd !== confirmPwd) { showToast('Le password non coincidono', 'error'); return; }

    withLoading($('#saveSecurity'), 'Aggiorno…', async () => {
      await new Promise(r => setTimeout(r, 500));
      showToast('Password aggiornata con successo', 'success');
      $('#secOld').value = '';
      $('#secNew').value = '';
      $('#secConfirm').value = '';
      $('#pwdStrengthBar').style.width = '0';
      $('#pwdStrengthText').textContent = 'Forza: —';
      setTimeout(() => showProfilePanel('menu'), 500);
    });
  });

  // THEME
  $('#themeBtn').addEventListener('click', () => {
    settings.dark = !settings.dark;
    saveSettings();
    applySettings();
    $('#darkToggle').checked = settings.dark;
    setTimeout(() => { drawMainChart(); drawDonut(); }, 100);
  });

  // MODAL TRANSAZIONI
  $('#viewAllBtn').addEventListener('click', openModal);
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalBackdrop').addEventListener('click', (e) => {
    if (e.target === $('#modalBackdrop')) closeModal();
  });
  $('#modalSearch').addEventListener('input', (e) => {
    modalFilter.search = e.target.value;
    renderModalTransactions();
  });
  $('#modalStatus').addEventListener('change', (e) => {
    modalFilter.status = e.target.value;
    renderModalTransactions();
  });

  // DETAIL MODAL
  $('#detailClose').addEventListener('click', () => $('#detailBackdrop').classList.remove('open'));
  $('#detailBackdrop').addEventListener('click', (e) => {
    if (e.target === $('#detailBackdrop')) $('#detailBackdrop').classList.remove('open');
  });

  // GLOBAL SEARCH
  $('#globalSearch').addEventListener('input', (e) => {
    const q = e.target.value;
    if (q.length > 1) {
      modalFilter.search = q;
      modalFilter.status = '';
      openModal();
      $('#modalSearch').value = q;
    }
  });

  // KEYBOARD SHORTCUTS
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      $('#globalSearch').focus();
    }
    if (e.key === 'Escape') {
      closeModal();
      $('#detailBackdrop').classList.remove('open');
      profileBackdrop.classList.remove('open');
      notifDropdown.classList.remove('open');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      refreshBtn.click();
    }
  });

  // RESIZE
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => {
      drawMainChart();
      drawDonut();
    }, 150);
  });

  // Modali: scroll lock + focus trap
  bindModalScrollLock();
  bindFocusTrap();
}

/* ============ INIT ============ */
function init() {
  applySettings();
  applyProfile();
  renderColorPicker();
  generateData(state.range);
  generateNotifications();

  // Ripristina vista e range salvati
  const savedView = localStorage.getItem('nowii_view') || 'dashboard';
  const savedRange = Number(localStorage.getItem('nowii_range')) || 30;
  state.range = savedRange;
  $$('.range-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.range) === savedRange));

  // 1) SPLASH (0 → 2.2s)
  const splash = $('#splash');
  setTimeout(() => {
    if (splash) {
      splash.classList.add('hidden');
      setTimeout(() => splash.remove(), 800);
    }
  }, 2200);

  // 2) SKELETON → APP (2.4s)
  setTimeout(() => {
    $('#skeleton').classList.add('hidden');
    $('#app').classList.add('ready');
  }, 2400);

  // 3) RENDER INIZIALE (2.5s)
  setTimeout(() => {
    renderKPIs();
    renderLegend();
    renderTransactions();
    requestAnimationFrame(() => {
      drawMainChart();
      drawDonut();
    });

    setTimeout(() => {
      showToast('Benvenuto nella dashboard', 'success');
    }, 400);
  }, 2500);

  bindEvents();
  bindSettings();
  switchView(savedView);
}

document.addEventListener('DOMContentLoaded', init);