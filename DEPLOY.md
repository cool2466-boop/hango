# 배포 — hango.kr

- **서버**: 118.91.155.135 (jeju-jobmatch·tripdrop·101tool과 동일 호스트)
- **웹서버**: Apache (80/443 전 사이트 처리)
- **포트**: 4200 (127.0.0.1 바인딩, 외부 비노출) — 4000=jeju-jobmatch, 4100=tripdrop 사용 중
- **경로**: `/home/shinbang/hango`
- **프로세스**: PM2 `hango`

## 1. DNS (Yesnic)

1. yesnic.com 로그인 → 도메인 관리 → `hango.kr`
2. **부가서비스 → 웹 포워딩(파킹) 해제** ← 현재 yesnic.com 프레임셋이 뜨는 원인
3. DNS 레코드 관리:

| 타입 | 호스트 | 값 | TTL |
|---|---|---|---|
| A | @ | 118.91.155.135 | 600 |
| A | www | 118.91.155.135 | 600 |

   (기존 `118.67.131.217` A 레코드 삭제)
4. 전파 확인: `nslookup hango.kr` → `118.91.155.135` (SSL 발급은 이게 끝나야 가능)

## 2. 코드 & DB

```bash
cd /home/shinbang
git clone git@github.com:cool2466-boop/hango.git
cd hango
npm ci
cp .env.example .env && vi .env      # DB_PASSWORD, ADMIN_TOKEN, IP_SALT 채우기 (PORT=4200 확인)

mysql -u root -p <<'SQL'
CREATE DATABASE hango CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hango_app'@'localhost' IDENTIFIED BY '<강한_비밀번호>';
GRANT ALL PRIVILEGES ON hango.* TO 'hango_app'@'localhost';
FLUSH PRIVILEGES;
SQL
npm run migrate

pm2 start server.cjs --name hango
pm2 save
curl -s localhost:4200/healthz    # {"ok":true}
```

## 3. Apache 리버스 프록시 + SSL

필요 모듈 (대개 이미 켜져 있음):

```bash
sudo a2enmod proxy proxy_http headers
```

`/etc/apache2/sites-available/hango.kr.conf`:

```apache
<VirtualHost *:80>
    ServerName hango.kr
    ServerAlias www.hango.kr

    ProxyPreserveHost On
    ProxyPass        / http://127.0.0.1:4200/
    ProxyPassReverse / http://127.0.0.1:4200/
    RequestHeader set X-Forwarded-Proto "http"

    ErrorLog  ${APACHE_LOG_DIR}/hango_error.log
    CustomLog ${APACHE_LOG_DIR}/hango_access.log combined
</VirtualHost>
```

```bash
sudo a2ensite hango.kr
sudo apache2ctl configtest && sudo systemctl reload apache2
sudo certbot --apache -d hango.kr -d www.hango.kr   # :443 vhost + http→https 리다이렉트 자동 생성
```

certbot 실행 후 `X-Forwarded-Proto`가 https로 잡히도록, 생성된 `hango.kr-le-ssl.conf`의 `<VirtualHost *:443>` 안에 다음이 있는지 확인(없으면 추가):

```apache
    RequestHeader set X-Forwarded-Proto "https"
```

## 4. 업데이트

```bash
cd /home/shinbang/hango && git pull && npm ci && npm run migrate && pm2 restart hango
```

## 5. 배포 후 확인

- `https://hango.kr` 접속 → 인트로 화면
- `https://hango.kr/admin/stats?token=<ADMIN_TOKEN>` → 퍼널 JSON
- 퀴즈 1회 완주 → `submissions`, `events`에 행 생성 확인
