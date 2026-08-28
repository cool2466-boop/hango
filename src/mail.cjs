'use strict';

// hango 결과지 이메일 발송 모듈
// 기본: 로컬 Postfix(sendmail) 사용. SMTP_HOST/USER/PASS 가 설정되면 SMTP 로 전환.
const nodemailer = require('nodemailer');

const FROM = process.env.MAIL_FROM || 'hango <no-reply@hango.kr>';

function transport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '') === '1',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return nodemailer.createTransport({ sendmail: true, newline: 'unix', path: '/usr/sbin/sendmail' });
}

const BAND = {
  ko: { below1: '1급 미만', level1: '1급', level2: '2급' },
  en: { below1: 'Below Level 1', level1: 'Level 1', level2: 'Level 2' },
  id: { below1: 'Di bawah Level 1', level1: 'Level 1', level2: 'Level 2' },
};

const TEXT = {
  ko: {
    title: 'hango TOPIK 2급 진단 결과',
    hello: '안녕하세요, hango입니다.',
    body: '요청하신 TOPIK 2급 진단 퀴즈 결과지를 보내드립니다.',
    band: '진단 등급',
    score: '예상 TOPIK I 총점',
    gap: '2급까지 남은 점수',
    pass: '2급 도달! 🎉',
    plan: '학습 플랜 안내',
    planBody: '1) 매일 EPS-TOPIK 공개문제집 읽기 영역 10문항씩 풀기\n2) 틀린 문항은 지문을 다시 읽고 단어를 정리하기\n3) 2주 후 hango에서 다시 진단해 보세요.',
    note: '※ 예상 점수는 읽기 영역만으로 외삽한 추정치입니다.',
    thanks: 'hango와 함께 2급 합격까지 화이팅하세요!',
    contact: '문의: hango.kr',
  },
  en: {
    title: 'hango TOPIK Level 2 Diagnostic Result',
    hello: 'Hello, this is hango.',
    body: 'Here is the result sheet for the TOPIK Level 2 diagnostic quiz you requested.',
    band: 'Diagnostic band',
    score: 'Projected TOPIK I total',
    gap: 'Points needed for Level 2',
    pass: 'Level 2 reached! 🎉',
    plan: 'Study plan',
    planBody: '1) Solve 10 reading questions from the EPS-TOPIK public workbook every day\n2) Re-read passages and organize vocabulary for wrong answers\n3) Take the diagnostic again on hango after 2 weeks.',
    note: '* The projected score is an estimate extrapolated from the reading section only.',
    thanks: 'Good luck reaching Level 2 with hango!',
    contact: 'Contact: hango.kr',
  },
  id: {
    title: 'Hasil Diagnostik TOPIK Level 2 hango',
    hello: 'Halo, ini hango.',
    body: 'Berikut hasil kuis diagnostik TOPIK Level 2 yang Anda minta.',
    band: 'Tingkat diagnostik',
    score: 'Perkiraan total TOPIK I',
    gap: 'Poin yang dibutuhkan untuk Level 2',
    pass: 'Level 2 tercapai! 🎉',
    plan: 'Rencana belajar',
    planBody: '1) Kerjakan 10 soal membaca dari buku soal publik EPS-TOPIK setiap hari\n2) Baca ulang teks dan catat kosakata untuk jawaban yang salah\n3) Ikuti diagnostik lagi di hango setelah 2 minggu.',
    note: '* Skor perkiraan adalah ekstrapolasi dari bagian membaca saja.',
    thanks: 'Semoga sukses mencapai Level 2 bersama hango!',
    contact: 'Kontak: hango.kr',
  },
};

function esc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendResultEmail({ to, lang = 'ko', band = 'below1', projectedTotal = 0 }) {
  const l = TEXT[lang] || TEXT.ko;
  const b = BAND[lang] || BAND.ko;
  const gap = Math.max(0, 140 - projectedTotal);
  const bandLabel = b[band] || band;
  const isPass = band === 'level2';

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f5fb;font-family:sans-serif">
  <div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e7f5">
    <div style="background:linear-gradient(135deg,#6d5bd0,#8b5cf6);padding:24px 28px;color:#fff">
      <div style="font-size:12px;letter-spacing:.2em;opacity:.8">HANGO</div>
      <h1 style="margin:6px 0 0;font-size:20px">${esc(l.title)}</h1>
    </div>
    <div style="padding:28px">
      <p style="margin:0 0 12px;color:#333;font-size:14px;line-height:1.7">${esc(l.hello)}<br/>${esc(l.body)}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px 12px;background:#f4f5fb;border-radius:10px 0 0 10px;color:#666;font-size:13px">${esc(l.band)}</td>
            <td style="padding:10px 12px;background:#f4f5fb;border-radius:0 10px 10px 0;font-weight:bold;color:#6d5bd0;font-size:15px">${esc(bandLabel)}</td></tr>
        <tr><td style="padding:10px 12px;color:#666;font-size:13px">${esc(l.score)}</td>
            <td style="padding:10px 12px;font-weight:bold;color:#222;font-size:15px">${esc(projectedTotal)} / 200</td></tr>
        <tr><td style="padding:10px 12px;background:#f4f5fb;border-radius:10px 0 0 10px;color:#666;font-size:13px">${esc(l.gap)}</td>
            <td style="padding:10px 12px;background:#f4f5fb;border-radius:0 10px 10px 0;font-weight:bold;color:${isPass ? '#16a34a' : '#dc2626'};font-size:15px">${isPass ? esc(l.pass) : esc(gap) + '점'}</td></tr>
      </table>
      <div style="background:#faf6ff;border:1px solid #e9ddfc;border-radius:12px;padding:16px">
        <div style="font-weight:bold;color:#6d5bd0;font-size:13px">${esc(l.plan)}</div>
        <pre style="margin:8px 0 0;font-family:sans-serif;font-size:13px;color:#444;line-height:1.7;white-space:pre-wrap">${esc(l.planBody)}</pre>
      </div>
      <p style="margin:16px 0 0;color:#999;font-size:11px;line-height:1.6">${esc(l.note)}</p>
      <p style="margin:12px 0 0;color:#333;font-size:13px">${esc(l.thanks)}</p>
    </div>
    <div style="background:#f8f9fe;padding:14px 28px;color:#a0a5c0;font-size:11px">${esc(l.contact)}</div>
  </div></body></html>`;

  const text = `${l.title}\n\n${l.hello}\n${l.body}\n\n- ${l.band}: ${bandLabel}\n- ${l.score}: ${projectedTotal}/200\n- ${l.gap}: ${isPass ? l.pass : gap + '점'}\n\n${l.plan}\n${l.planBody}\n\n${l.note}\n${l.thanks}\n\n${l.contact}`;

  const tr = transport();
  try {
    await tr.sendMail({ from: FROM, to, subject: `[hango] ${l.title}`, html, text });
    return { ok: true };
  } catch (e) {
    console.error('[mail]', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendResultEmail };
