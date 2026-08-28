'use strict';

const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');

const pool = require('../db.cjs');
const { listSets, getSet, publicSet, nextSetId } = require('../quiz/sets.cjs');
const { score } = require('../quiz/scoring.cjs');

const router = express.Router();

const IP_SALT = process.env.IP_SALT || 'hango-dev-salt';
function hashIp(req) {
  const ip = req.ip || '';
  return crypto.createHash('sha256').update(ip + IP_SALT).digest('hex');
}

function clean(v, max = 200) {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 40, standardHeaders: true, legacyHeaders: false });

// --- 문항 세트 목록 -----------------------------------------------------------
router.get('/sets', (_req, res) => {
  res.json({ sets: listSets() });
});

// --- 특정 세트 문항 (정답 제외) ---------------------------------------------
router.get('/sets/:id', (req, res) => {
  const set = publicSet(req.params.id);
  if (!set) return res.status(404).json({ error: 'set_not_found' });
  res.json(set);
});

// --- 이벤트 로깅 (1단계 배포 테스트의 핵심) --------------------------------
router.post('/events', writeLimiter, async (req, res) => {
  try {
    const b = req.body || {};
    const type = clean(b.event_type, 40);
    const session = clean(b.session_id, 36);
    if (!type || !session) return res.status(400).json({ error: 'bad_request' });

    await pool.execute(
      `INSERT INTO events
        (session_id, event_type, quiz_set, lang, utm_source, utm_medium, utm_campaign, referrer, user_agent, ip_hash, meta)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        session,
        type,
        clean(b.quiz_set, 40),
        clean(b.lang, 8),
        clean(b.utm_source, 120),
        clean(b.utm_medium, 120),
        clean(b.utm_campaign, 120),
        clean(b.referrer, 512),
        clean(req.get('user-agent'), 512),
        hashIp(req),
        b.meta ? JSON.stringify(b.meta).slice(0, 4000) : null,
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[events]', err.message);
    res.status(500).json({ error: 'server_error' });
  }
});

// --- 채점 + 제출 저장 -------------------------------------------------------
router.post('/submit', writeLimiter, async (req, res) => {
  try {
    const b = req.body || {};
    const session = clean(b.session_id, 36);
    const setId = clean(b.quiz_set, 40);
    const set = getSet(setId);
    if (!session || !set) return res.status(400).json({ error: 'bad_request' });

    const answers = Array.isArray(b.answers) ? b.answers : [];
    let raw = 0;
    const detail = set.questions.map((q, i) => {
      const picked = Number.isInteger(answers[i]) ? answers[i] : -1;
      const correct = picked === q.answer;
      if (correct) raw += 1;
      return { no: i + 1, picked, answer: q.answer, correct };
    });

    const total = set.questions.length;
    const s = score(raw, total);

    await pool.execute(
      `INSERT INTO submissions
        (session_id, quiz_set, lang, raw_score, total_questions, projected_total, band, answers)
       VALUES (?,?,?,?,?,?,?,?)`,
      [session, setId, clean(b.lang, 8), raw, total, s.projectedTotal, s.band, JSON.stringify(detail)]
    );

    res.json({
      raw_score: raw,
      total_questions: total,
      projected_total: s.projectedTotal,
      band: s.band,
      gap_to_level2: s.gapTo2,
      review: detail,
      next_set: nextSetId(setId),
    });
  } catch (err) {
    console.error('[submit]', err.message);
    res.status(500).json({ error: 'server_error' });
  }
});

// --- 리드 수집 -----------------------------------------------------------
router.post('/leads', writeLimiter, async (req, res) => {
  try {
    const b = req.body || {};
    const session = clean(b.session_id, 36);
    const contactType = clean(b.contact_type, 16);
    const contactValue = clean(b.contact_value, 255);
    if (!session || !contactType || !contactValue) return res.status(400).json({ error: 'bad_request' });
    if (!['email', 'phone', 'kakao'].includes(contactType)) return res.status(400).json({ error: 'bad_contact_type' });
    if (!b.consent) return res.status(400).json({ error: 'consent_required' });

    await pool.execute(
      `INSERT INTO leads
        (session_id, contact_type, contact_value, lang, nationality, projected_total, band, consent)
       VALUES (?,?,?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE session_id=VALUES(session_id), lang=VALUES(lang),
         nationality=VALUES(nationality), projected_total=VALUES(projected_total), band=VALUES(band)`,
      [
        session,
        contactType,
        contactValue,
        clean(b.lang, 8),
        clean(b.nationality, 40),
        Number.isInteger(b.projected_total) ? b.projected_total : null,
        clean(b.band, 16),
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[leads]', err.message);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
