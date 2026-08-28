# 배포 — hango.kr (서버 118.91.155.135, job-match와 동일 호스트)

## 1. DNS (Yesnic)

1. yesnic.com 로그인 → 도메인 관리 → `hango.kr`
2. **부가서비스 → 웹 포워딩(파킹) 해제** ← 현재 yesnic.com 프레임셋이 뜨는 원인
3. DNS 레코드 관리:

| 타입 | 호스트 | 값 | TTL |
|---|---|---|---|
| A | @ | 118.91.155.135 | 600 |
| A | www | 118.91.155.135 | 600 |

   (기존 `118.67.131.217` A 레코드 삭제)
4. 전파 확인: `nslookup hango.kr` → `118.91.155.135`

## 2. 서버

```bash
# 코드
cd /home/shinbang
git clone git@github.com:cool2466-boop/hango.git
cd hango
npm ci
cp .env.example .env && vi .env      # DB_PASSWORD, ADMIN_TOKEN, IP_SALT 채우기

# DB
mysql -u root -p <<'SQL'
CREATE DATABASE hango CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hango_app'@'localhost' IDENTIFIED BY '<강한_비밀번호>';
GRANT ALL PRIVILEGES ON hango.* TO 'hango_app'@'localhost';
FLUSH PRIVILEGES;
SQL
npm run migrate

# 프로세스
pm2 start server.cjs --name hango
pm2 save
```

## 3. nginx + SSL

`/etc/nginx/sites-available/hango.kr`:

```nginx
server {
    server_name hango.kr www.hango.kr;
    location / {
        proxy_pass http://127.0.0.1:4100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    listen 80;
}
```

```bash
ln -s /etc/nginx/sites-available/hango.kr /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d hango.kr -d www.hango.kr
```

## 4. 업데이트

```bash
cd /home/shinbang/hango && git pull && npm ci && npm run migrate && pm2 restart hango
```
