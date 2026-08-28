# hango.kr — 1단계 배포 킷 (유통 테스트)

목적: **제품이 아니라 유통을 검증한다.** "광고비 거의 없이 2주 안에 타겟(재한 외국인)이 모이는가?"

타겟: 한국에 이미 있는 외국인 노동자·유학생 중 **비자 레벨업(E-7-4 숙련기능인력, KIIP/사회통합프로그램)을 위해 TOPIK 2급이 필요한 사람.**

---

## 1. UTM 링크 세트

기본형: `https://hango.kr/?lang=<L>&utm_source=<S>&utm_medium=<M>&utm_campaign=<C>`

- `lang` : `ko` `en` `vi` `id` `ne` — 랜딩 페이지 언어 즉시 결정
- `utm_campaign` : 1차 파동 = `launch1`, 2주 뒤 재게시 = `launch2` (비교용)
- 관리자 통계가 `utm_source` + `utm_campaign` 로 집계됨

| # | 언어 | 채널 | 붙여넣을 링크 |
|---|---|---|---|
| 1 | VI | FB 그룹 (재한 베트남 노동자/EPS) | `https://hango.kr/?lang=vi&utm_source=fb-vn-workers&utm_medium=post&utm_campaign=launch1` |
| 2 | VI | FB 그룹 (재한 베트남 커뮤니티) | `https://hango.kr/?lang=vi&utm_source=fb-vn-community&utm_medium=post&utm_campaign=launch1` |
| 3 | VI | Zalo / 개인 공유 | `https://hango.kr/?lang=vi&utm_source=zalo-vn&utm_medium=dm&utm_campaign=launch1` |
| 4 | NE | FB 그룹 (Nepali in Korea) | `https://hango.kr/?lang=ne&utm_source=fb-np-korea&utm_medium=post&utm_campaign=launch1` |
| 5 | NE | FB 그룹 (EPS Nepal) | `https://hango.kr/?lang=ne&utm_source=fb-np-eps&utm_medium=post&utm_campaign=launch1` |
| 6 | NE | Viber 커뮤니티 | `https://hango.kr/?lang=ne&utm_source=viber-np&utm_medium=dm&utm_campaign=launch1` |
| 7 | ID | FB 그룹 (Orang Indonesia di Korea) | `https://hango.kr/?lang=id&utm_source=fb-id-korea&utm_medium=post&utm_campaign=launch1` |
| 8 | ID | FB 그룹 (Pekerja Migran / TKI Korea) | `https://hango.kr/?lang=id&utm_source=fb-id-workers&utm_medium=post&utm_campaign=launch1` |
| 9 | KO/EN | 네이버 카페 (외국인·이주노동·다문화) | `https://hango.kr/?lang=en&utm_source=naver-cafe&utm_medium=post&utm_campaign=launch1` |
| 10 | EN | 카카오톡 오픈채팅 (EPS / TOPIK / 외국인 한국어 검색) | `https://hango.kr/?lang=en&utm_source=kakao-openchat&utm_medium=post&utm_campaign=launch1` |
| 11 | KO | 다문화가족지원센터 (파트너 요청) | `https://hango.kr/?lang=ko&utm_source=partner-damunhwa&utm_medium=referral&utm_campaign=launch1` |
| 12 | KO | 외국인주민지원센터 / 이주민센터 (파트너) | `https://hango.kr/?lang=ko&utm_source=partner-support-center&utm_medium=referral&utm_campaign=launch1` |
| 13 | EN | 대학 국제교류처 (D-2/D-4 유학생) | `https://hango.kr/?lang=en&utm_source=univ-intl&utm_medium=referral&utm_campaign=launch1` |
| 14 | multi | 오프라인 전단/포스터 QR | `https://hango.kr/?lang=vi&utm_source=flyer-qr&utm_medium=qr&utm_campaign=launch1` |
| 15 | KO | job-match 기존 유저·고용주 크로스포스트 | `https://hango.kr/?lang=ko&utm_source=jobmatch&utm_medium=crosspost&utm_campaign=launch1` |

> QR: 위 14번 URL을 QR 생성기에 넣어 전단·게시판에 부착. 언어별로 `lang=` 만 바꿔 여러 장.

---

## 2. 게시 문구 (그대로 복사)

각 언어: **① 그룹 게시글 ② 짧은 댓글/DM**. `<링크>` 자리에 위 표의 해당 링크를 넣으세요.

### 한국어 (job-match 크로스포스트 · 네이버 카페 · 파트너)

**① 게시글**
```
[무료] 내 한국어, TOPIK 2급에 얼마나 가까울까? — 5분 진단 테스트

한국에서 계속 일하려면(E-7-4 숙련기능인력 비자, 사회통합프로그램) TOPIK 2급이 필요합니다.
지금 내 실력이 2급에서 몇 점 부족한지 5분 만에 확인해 보세요.

✅ 무료 · 회원가입 없음 · 한국어/영어/베트남어/인도네시아어
👉 <링크>

결과와 함께 2급 합격 학습 플랜도 보내드립니다.
```

**② 댓글/DM**
```
TOPIK 2급 진단 5분이면 돼요. 무료·가입 없음 → <링크>
```

### English (Kakao open chat · Naver cafe · 대학)

**① Post**
```
[Free] How close is your Korean to TOPIK Level 2? — 5-minute test

To keep working in Korea (E-7-4 skilled worker visa, KIIP program) you need TOPIK Level 2.
Find out in 5 minutes how many points you still need.

✅ Free · No sign-up · KO / EN / VI / ID
👉 <link>

You'll get your result plus a study plan to pass Level 2.
```

**② Comment/DM**
```
Free 5-min TOPIK Level 2 check, no sign-up → <link>
```

### Tiếng Việt

**① Bài đăng**
```
[Miễn phí] Tiếng Hàn của bạn cách TOPIK cấp 2 bao xa? — Bài test 5 phút

Nếu bạn muốn tiếp tục làm việc tại Hàn Quốc (visa lao động lành nghề E-7-4, chương trình KIIP), bạn cần TOPIK cấp 2.
Chỉ 5 phút để biết bạn còn thiếu bao nhiêu điểm.

✅ Miễn phí · Không cần đăng ký · Tiếng Việt / Hàn / Anh / Indonesia
👉 <link>

Nhận kết quả kèm kế hoạch học để đậu cấp 2.
```

**② Bình luận/Tin nhắn**
```
Test TOPIK cấp 2 miễn phí, 5 phút, không cần đăng ký → <link>
```

### Bahasa Indonesia

**① Postingan**
```
[Gratis] Seberapa dekat bahasa Korea Anda dengan TOPIK Level 2? — Tes 5 menit

Kalau Anda ingin terus bekerja di Korea (visa pekerja terampil E-7-4, program KIIP), Anda butuh TOPIK Level 2.
Cari tahu dalam 5 menit berapa poin lagi yang Anda perlukan.

✅ Gratis · Tanpa daftar · Indonesia / Korea / Inggris / Vietnam
👉 <link>

Dapatkan hasil Anda plus rencana belajar untuk lulus Level 2.
```

**② Komentar/DM**
```
Tes TOPIK Level 2 gratis, 5 menit, tanpa daftar → <link>
```

### नेपाली (⚠️ 원어민 검수 필요 — 게시 전 재한 네팔인 지인에게 확인)

**① पोस्ट**
```
[निःशुल्क] तपाईंको कोरियन भाषा TOPIK लेभल २ को कति नजिक छ? — ५ मिनेटको परीक्षा

कोरियामा काम जारी राख्न (E-7-4 दक्ष कामदार भिसा, KIIP कार्यक्रम) लाई TOPIK लेभल २ चाहिन्छ।
५ मिनेटमा थाहा पाउनुहोस् — तपाईंलाई कति अंक बाँकी छ।

✅ निःशुल्क · दर्ता आवश्यक छैन · नेपाली / कोरियन / अंग्रेजी
👉 <link>
```

**② कमेन्ट/सन्देश**
```
निःशुल्क TOPIK लेभल २ परीक्षण, ५ मिनेट, दर्ता चाहिँदैन → <link>
```

---

## 3. 게시 규칙 (계정 밴 방지 — 중요)

- **그룹 관리자에게 먼저 허락**을 구하거나 그룹 규칙(홍보 허용 여부)을 확인.
- **하루에 1~2개 그룹만**. 같은 계정으로 여러 그룹에 연속 도배 → 페이스북이 스팸으로 차단.
- 링크만 던지지 말 것. **맥락(왜 유용한지) 2~3줄 + 댓글에 성실히 응답.**
- **재한 외국인 지인(실사용자) 계정으로 게시하면 도달·신뢰도가 훨씬 높다.** 1순위 전략.
- 파트너 채널(다문화센터·이주민센터·대학 국제처)은 담당자에게 **이메일/전화로 정중히 요청** — "재한 외국인분들께 무료로 제공하는 TOPIK 자가진단입니다. 안내에 공유해 주실 수 있을까요?"
- 2주차 재게시는 `utm_campaign=launch2` 로 바꿔서 (1차와 비교).

---

## 4. 추적 & 판정

**매일 1회 확인** (토큰은 서버 `.env` / `/tmp/hango_*.txt`):
- 대시보드: `https://hango.kr/admin/stats?token=<ADMIN_TOKEN>`
- 리드 CSV: `https://hango.kr/admin/leads.csv?token=<ADMIN_TOKEN>`

보는 지표:
| 지표 | 위치 | 의미 |
|---|---|---|
| `funnel` | page_view / quiz_start / quiz_complete / lead_submit 세션 수 | 단계별 이탈 |
| `by_utm` | source·campaign별 세션 | 어느 채널이 유입을 주는가 |
| `submissions_by_band` | below1 / level1 / level2 분포 | 타겟이 맞는가 (level1 근처가 많아야 정상) |
| `leads_total` | 리드 수 | 지불의사 신호 |
| `by_utm` 의 `source=share` | 앱 내 공유 버튼 유입 | **자연 확산(바이럴) 신호** — 이게 붙으면 매우 좋음 |

**Day 3 체크** — `page_view` 세션 50+ 인가?
- 예 → 계속.
- 아니오 → 채널이 안 맞음. 실사용자 경유 게시 / 다른 커뮤니티로 전환.

**Day 14 판정:**
| 결과 | 조건 | 다음 |
|---|---|---|
| 🟢 GO | page_view 300+, 완주율(quiz_complete/page_view) 40%+, 리드전환(lead_submit/quiz_complete) 15%+ | 2단계: 제품 빌드 (유료 모의고사 + AI 첨삭 + 튜터/고용주 B2B) |
| 🟡 PIVOT | 유입은 되는데 완주·리드 낮음 | 퀴즈 UX·가치제안·문항 수정 후 재테스트 |
| 🔴 STOP | page_view 100 미만 | 유통 채널 자체가 안 됨. 제품 빌드 보류, 채널 재설계 |

---

## 5. 게시할 곳 리스트업 (Jason 채우기)

실제 그룹명·URL·관리자 연락을 여기 기록:

| 링크# | 채널명 | URL | 상태 | 게시일 |
|---|---|---|---|---|
| 1 | (예: Người Việt Nam tại Hàn Quốc) | | 미게시 | |
| 4 | (예: Nepali Society Korea) | | 미게시 | |
| 7 | (예: Komunitas Indonesia di Korea) | | 미게시 | |
| 11 | (예: OO시 다문화가족지원센터) | | 연락 예정 | |
