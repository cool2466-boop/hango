'use strict';

// public/ 아래 .html 을 스캔해 public/sitemap.xml 생성.
// 게이트된 페이지(admin 등)는 없음. privacy 는 noindex 라 제외.
const fs = require('fs');
const path = require('path');

const BASE = 'https://hango.kr';
const PUB = path.join(__dirname, '..', 'public');
const EXCLUDE = new Set(['/privacy']);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

const urls = walk(PUB)
  .map((f) => '/' + path.relative(PUB, f).replace(/\\/g, '/'))
  .map((u) => u.replace(/\/index\.html$/, '/').replace(/\.html$/, ''))
  .filter((u) => !EXCLUDE.has(u))
  .sort();

const today = new Date().toISOString().slice(0, 10);
const body = urls
  .map((u) => `  <url><loc>${BASE}${u}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

fs.writeFileSync(path.join(PUB, 'sitemap.xml'), xml);
console.log(`[sitemap] ${urls.length} URLs → public/sitemap.xml`);
