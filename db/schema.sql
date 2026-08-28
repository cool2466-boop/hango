-- hango.kr MVP 스키마
-- 목적: 배포 테스트(1단계) - 유입/완료/공유/리드 전환율 측정

CREATE TABLE IF NOT EXISTS events (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id    CHAR(36)        NOT NULL,
  event_type    VARCHAR(40)     NOT NULL,   -- page_view | quiz_start | quiz_complete | result_view | share_click | lead_submit
  quiz_set      VARCHAR(40)     NULL,
  lang          VARCHAR(8)      NULL,
  utm_source    VARCHAR(120)    NULL,
  utm_medium    VARCHAR(120)    NULL,
  utm_campaign  VARCHAR(120)    NULL,
  referrer      VARCHAR(512)    NULL,
  user_agent    VARCHAR(512)    NULL,
  ip_hash       CHAR(64)        NULL,       -- SHA-256(ip + salt), 원본 IP 저장 안 함
  meta          JSON            NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_events_session (session_id),
  KEY idx_events_type_time (event_type, created_at),
  KEY idx_events_utm (utm_source, utm_campaign)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS submissions (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id       CHAR(36)        NOT NULL,
  quiz_set         VARCHAR(40)     NOT NULL,
  lang             VARCHAR(8)      NULL,
  raw_score        TINYINT UNSIGNED NOT NULL,   -- 맞춘 문항 수
  total_questions  TINYINT UNSIGNED NOT NULL,
  projected_total  SMALLINT UNSIGNED NOT NULL,  -- 예상 TOPIK I 총점(0-200), 추정치
  band             VARCHAR(16)     NOT NULL,    -- below1 | level1 | level2
  answers          JSON            NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sub_session (session_id),
  KEY idx_sub_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id     CHAR(36)        NOT NULL,
  contact_type   VARCHAR(16)     NOT NULL,   -- email | phone | kakao
  contact_value  VARCHAR(255)    NOT NULL,
  lang           VARCHAR(8)      NULL,
  nationality    VARCHAR(40)     NULL,
  projected_total SMALLINT UNSIGNED NULL,
  band           VARCHAR(16)     NULL,
  consent        TINYINT(1)      NOT NULL DEFAULT 0,
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lead (contact_type, contact_value),
  KEY idx_lead_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
