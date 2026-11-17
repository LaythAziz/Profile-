const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('portfolio keeps all 73 original Instagram service entries as the starting catalog', () => {
  assert.equal((html.match(/class="offer-no"/g) || []).length, 73);
});

test('checkout and payment details stay hidden until the user requests a service', () => {
  assert.match(html, /id="service-order"[^>]*hidden/);
  assert.match(html, /data-open-order/);
});

test('page uses cacheable external CSS and deferred JavaScript assets', () => {
  assert.match(html, /href="\\/assets\\/profile\\.css(?:\\?[^"]*)?"/);
  assert.match(html, /src="\\/assets\\/profile\\.js(?:\\?[^"]*)?" defer/);
  assert.ok(fs.existsSync(path.join(root, 'assets/profile.css')));
  assert.ok(fs.existsSync(path.join(root, 'assets/profile.js')));
});

test('page includes accessible skip navigation and search metadata', () => {
  assert.match(html, /class="skip-link"[^>]*href="#main-content"/);
  assert.match(html, /<main[^>]*id="main-content"/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /application\/ld\+json/);
});

test('external browser code parses without syntax errors', () => {
  const js = fs.readFileSync(path.join(root, 'assets/profile.js'), 'utf8');
  assert.doesNotThrow(() => new Function(js));
});

test('Telegram proxy endpoint only serves GET requests', async () => {
  const handler = require('../api/telegram-proxies');
  const headers = {};
  let status;
  const response = { setHeader: (key, value) => { headers[key] = value; }, status(code) { status = code; return this; }, json(body) { this.body = body; return this; } };
  await handler({ method: 'POST' }, response);
  assert.equal(status, 405);
  assert.equal(headers.Allow, 'GET');
});

test('Telegram proxy endpoint falls back to a healthy source and returns validated deep links', async () => {
  const handler = require('../api/telegram-proxies');
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (url.includes('0xRadikal')) return { ok: false, text: async () => '' };
    return { ok: true, text: async () => ['not-a-proxy', 'tg://proxy?server=proxy.example.com&port=443&secret=0123456789abcdef', 'tg://proxy?server=bad.example.com&port=99999&secret=0123456789abcdef'].join('\n') };
  };
  const headers = {};
  let status;
  const response = { setHeader: (key, value) => { headers[key] = value; }, status(code) { status = code; return this; }, json(body) { this.body = body; return this; } };
  try {
    await handler({ method: 'GET' }, response);
    assert.equal(status, 200);
    assert.equal(response.body.source, 'iwizard7 · Stable');
    assert.equal(response.body.proxies.length, 1);
    assert.match(response.body.proxies[0].href, /^https:\/\/t\.me\/proxy\?/);
    assert.match(headers['Vercel-CDN-Cache-Control'], /s-maxage=600/);
  } finally { global.fetch = originalFetch; }
});

test('SEO discovery files and Vercel configuration are valid', () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.ok(vercel.headers.some(rule => rule.source === '/assets/(.*)'));
  assert.match(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8'), /Sitemap:/);
  assert.match(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'), /<loc>https:\/\/laythaziz\.vercel\.app\//);
  assert.ok(fs.existsSync(path.join(root, 'assets/favicon.svg')));
});

test('all remembered public social destinations are present and open safely', () => {
  for (const url of ['https://www.tiktok.com/@i713l', 'https://youtube.com/@lynz317', 'https://www.facebook.com/share/19qB1j43an/?mibextid=wwXIfr']) {
    assert.ok(html.includes(url), 'Missing social URL: ' + url);
  }
  assert.doesNotMatch(html, /target="_blank"(?![^>]*rel="[^"]*noopener)/);
  assert.doesNotMatch(html, /github\.com\/LaythAziz|<strong>GitHub<\/strong>/);
});

test('Telegram proxy endpoint returns a non-cacheable error when all sources fail', async () => {
  const handler = require('../api/telegram-proxies');
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, text: async () => '' });
  const headers = {};
  let status;
  const response = { setHeader: (key, value) => { headers[key] = value; }, status(code) { status = code; return this; }, json(body) { this.body = body; return this; } };
  try {
    await handler({ method: 'GET' }, response);
    assert.equal(status, 503);
    assert.match(headers['Cache-Control'], /no-store/);
  } finally { global.fetch = originalFetch; }
});

test('service checkout validates Instagram usernames and builds a readable Telegram message', () => {
  const js = fs.readFileSync(path.join(root, 'assets/profile.js'), 'utf8');
  assert.match(js, /input\.setCustomValidity/);
  assert.ok(js.includes("].join('\\n')"));
  assert.match(js, /replace\(\/\^@\//);
});

test('admin email OTP input accepts Supabase codes from 6 through 10 digits', () => {
  const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
  const adminJs = fs.readFileSync(path.join(root, 'assets/admin.js'), 'utf8');
  assert.match(adminHtml, /pattern="\[0-9\]\{6,10\}"/);
  assert.match(adminHtml, /maxlength="10" minlength="6"/);
  assert.match(adminJs, /\/\^\\d\{6,10\}\$\//);
  assert.match(adminJs, /token,\s*type:\s*'email'/);
});

test('admin login uses a versioned script URL to bypass stale cached OTP validation', () => {
  const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
  assert.match(adminHtml, /src="\/assets\/admin\.js\?v=control-center-20261118"/);
});

test('admin email validation accepts normal Gmail addresses with whitespace trimmed', () => {
  const adminJs = fs.readFileSync(path.join(root, 'assets/admin.js'), 'utf8');
  assert.match(adminJs, /emailInput\.validity\.valid/);
  assert.match(adminJs, /function enteredEmail\(\) \{ return emailInput\.value\.trim\(\)\.toLowerCase\(\); \}/);
});

test('visitor tracking requires consent and records a page view plus 10-second heartbeats', () => {
  const js = fs.readFileSync(path.join(root, 'assets/profile.js'), 'utf8');
  assert.match(js, /profileAnalyticsConsent/);
  assert.match(js, /eventType:\s*'page_view'/);
  assert.match(js, /eventType:\s*'heartbeat'/);
  assert.match(js, /10000/);
  assert.match(js, /consent:\s*true/);
  assert.match(js, /visitorName/);
});

test('public services catalog renders newly created services instead of only the original static 73', () => {
  const js = fs.readFileSync(path.join(root, 'assets/profile.js'), 'utf8');
  assert.match(js, /createElement\('details'\)/);
  assert.match(js, /service\.service_code/);
  assert.match(js, /offer-count/);
});

test('admin dashboard supports live visitor search and service create/delete actions', () => {
  const html = fs.readFileSync(path.join(root, 'control-center.html'), 'utf8');
  const js = fs.readFileSync(path.join(root, 'assets/admin-dashboard.js'), 'utf8');
  assert.match(html, /visitor-search/);
  assert.match(html, /visitor-table/);
  assert.match(js, /get_profile_visitor_summary/);
  assert.match(js, /ip_address/);
  assert.match(html, /data-add-service/);
  assert.match(js, /data-delete-service/);
  assert.match(js, /10000/);
});

test('admin visitor records are protected by owner-only database access', () => {
  const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20261118000000_owner_visitor_analytics_and_service_management.sql'), 'utf8');
  assert.match(sql, /Only active owner can manage analytics/);
  assert.match(sql, /role = 'owner'/);
  assert.match(sql, /ip_address/);
});
