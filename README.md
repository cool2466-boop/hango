# hango.kr — TOPIK 2급 진단 퀴즈 (MVP / 1단계 배포 테스트)

한국에서 일하는 외국인을 대상으로 한 **무료 TOPIK 2급 진단 테스트**.
목적은 제품이 아니라 **유통 검증**입니다 — "광고비 거의 없이 2주 안에 타겟이 모이는가?"

## 성공 기준 (2주)

| 지표 | 목표 |
|---|---|
| `page_view` 세션 | 300~500+ |
| `quiz_complete` / `page_view` | ≥ 40% |
| `lead_submit` / `quiz_complete` | ≥ 15% |
| 자연 유입(`utm_source=share`) 비중 | 유의미하게 발생 |

미달 시 → 제품 빌드로 넘어가지 않고 유통 채널부터 재검토.

## 스택

- Node.js ≥ 20, Express 5, MySQL 8, 순수 HTML/CSS/JS (빌드 없음), PM2, Apache 리버스 프록시
- 포트 4200 (서버 공용 호스트: 4000=jeju-jobmatch, 4100=tripdrop)
- 프론트 i18n: `public/locales/*.json` (ko·en·vi 완역 / km·ne·id 영어 폴백)

## 로컬 실행

```bash
cp .env.example .env      # DB 값 입력
npm install
npm run migrate           # db/schema.sql 적용
npm start                 # http://localhost:4200
```

## 문항 세트

- `src/quiz/sets/diagnostic-01.cjs` — TOPIK I 유형 참고 **자체 창작** 15문항 (저작권 안전, 기본 제공)
- 공개 기출 세트 추가: `src/quiz/sets/<id>.cjs` 생성 → `src/quiz/sets.cjs` 의 `registry`/`order` 에 등록
  - 재배포 약관 확인 필수. **EPS-TOPIK 공개문제집(한국산업인력공단)** 이 학습목적 공개라 가장 안전
  - 세트가 여러 개면 결과 화면의 "다른 세트 풀어보기"가 순환

## 관리자 (배포 테스트 판정)

- `GET /admin/stats?token=<ADMIN_TOKEN>` — 퍼널·UTM·밴드 분포
- `GET /admin/leads.csv?token=<ADMIN_TOKEN>` — 리드 CSV

## 개인정보

- IP는 원본 저장하지 않고 `SHA-256(ip + salt)` 해시만 저장
- 리드는 동의(`consent`) 필수, `(contact_type, contact_value)` 유니크
- 운영 전환 시: 개인정보처리방침 페이지, 수신거부 링크, 문의 채널 추가 필요
