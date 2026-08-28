'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');

const quizRouter = require('./src/routes/quiz.cjs');
const adminRouter = require('./src/routes/admin.cjs');

const app = express();

// Apache 리버스 프록시 뒤 - 클라이언트 IP / 프로토콜 인식
app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));

app.use(express.json({ limit: '256kb' }));

// 정적 프론트엔드
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// API
app.use('/api', quizRouter);
app.use('/admin', adminRouter);

// 헬스체크
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// SPA 폴백 (알 수 없는 경로는 랜딩으로)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

const port = Number(process.env.PORT || 4200);
app.listen(port, '127.0.0.1', () => {
  console.log(`[hango] listening on 127.0.0.1:${port} (${process.env.NODE_ENV || 'development'})`);
});
