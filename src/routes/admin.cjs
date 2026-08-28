'use strict';

const express = require('express');
const pool = require('../db.cjs');

const router = express.Router();

// 아주 단순한 토큰 게이트 (MVP 전용). 운영 전환 시 교체할 것.
router.use((req, res, next) => {
  const token = req.query.token || req.get('x-admin-token');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
});

// 퍼널 요약: 배포 테스트 성공 판정용
router.get('/stats', async (_req, res) => {
  try {
    const [funnel] = await pool.query(`
      SELECT event_type, COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS n
      FROM events GROUP BY event_type`);
    const [byUtm] = await pool.query(`
      SELECT COALESCE(utm_source,'(direct)') AS source,
             COALESCE(utm_campaign,'(none)') AS campaign,
             COUNT(DISTINCT session_id) AS sessions
      FROM events WHERE event_type='page_view'
      GROUP BY source, campaign ORDER BY sessions DESC LIMIT 50`);
    const [subs] = await pool.query(`
      SELECT band, COUNT(*) AS n, ROUND(AVG(projected_total)) AS avg_projected
      FROM submissions GROUP BY band`);
    const [leadCount] = await pool.query(`SELECT COUNT(*) AS n FROM leads`);
    const [daily] = await pool.query(`
      SELECT DATE(created_at) AS d, event_type, COUNT(DISTINCT session_id) AS sessions
      FROM events GROUP BY d, event_type ORDER BY d DESC LIMIT 90`);

    res.json({
      funnel,
      by_utm: byUtm,
      submissions_by_band: subs,
      leads_total: leadCount[0].n,
      daily,
      note: '성공 기준: 2주 내 page_view 세션 300~500+, quiz_complete/page_view >= 40%, lead_submit/quiz_complete >= 15%',
    });
  } catch (err) {
    console.error('[admin/stats]', err.message);
    res.status(500).json({ error: 'server_error' });
  }
});

router.get('/leads.csv', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT created_at, contact_type, contact_value, lang, nationality, projected_total, band FROM leads ORDER BY created_at DESC`
    );
    const head = 'created_at,contact_type,contact_value,lang,nationality,projected_total,band\n';
    const body = rows
      .map((r) =>
        [r.created_at.toISOString(), r.contact_type, r.contact_value, r.lang || '', r.nationality || '', r.projected_total || '', r.band || '']
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="hango-leads.csv"');
    res.send(head + body);
  } catch (err) {
    console.error('[admin/leads.csv]', err.message);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
