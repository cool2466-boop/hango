'use strict';

// 아주 단순한 마이그레이터: db/schema.sql 을 통째로 실행한다 (CREATE TABLE IF NOT EXISTS).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  await conn.query(sql);
  await conn.end();
  console.log('[migrate] schema applied');
})().catch((e) => {
  console.error('[migrate] failed:', e.message);
  process.exit(1);
});
