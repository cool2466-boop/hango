#!/bin/bash
set -u
LOG=/home/shinbang/hango/deploy-ssl.log
if [ -d /etc/letsencrypt/live/hango.kr ]; then
  crontab -l 2>/dev/null | grep -v "wait-dns-and-ssl" | crontab -
  echo "$(date "+%F %T") cert exists; cron removed" >> "$LOG"
  exit 0
fi
STABLE=1
for i in 1 2 3; do
  R=$(nslookup hango.kr 8.8.8.8 2>/dev/null | grep -A1 "^Name:" | tail -1 | awk "{print \$2}")
  if [ "$R" != "118.91.155.135" ]; then STABLE=0; fi
  sleep 2
done
if [ "$STABLE" != "1" ]; then
  echo "$(date "+%F %T") DNS not stable yet (last=$R)" >> "$LOG"
  exit 0
fi
echo "$(date "+%F %T") DNS stable - certbot start" >> "$LOG"
certbot --apache -d hango.kr -d www.hango.kr --non-interactive --agree-tos --redirect >> "$LOG" 2>&1
if [ -d /etc/letsencrypt/live/hango.kr ]; then
  CONF=/etc/apache2/sites-available/hango.kr-le-ssl.conf
  if [ -f "$CONF" ] && ! grep -q "X-Forwarded-Proto \"https\"" "$CONF"; then
    sed -i "s#ProxyPassReverse / http://127.0.0.1:4200/#ProxyPassReverse / http://127.0.0.1:4200/\n  RequestHeader set X-Forwarded-Proto \"https\"#" "$CONF"
    systemctl reload apache2
    echo "$(date "+%F %T") X-Forwarded-Proto https added + reload" >> "$LOG"
  fi
  crontab -l 2>/dev/null | grep -v "wait-dns-and-ssl" | crontab -
  echo "$(date "+%F %T") SSL DONE; cron removed" >> "$LOG"
fi
