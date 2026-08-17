#!/usr/bin/env bash
set -euo pipefail

release_id="${1:-$(date +%Y%m%d%H%M%S)}"
if [[ ! "$release_id" =~ ^[0-9]{14}$ ]]; then
  echo "Release id must contain exactly 14 digits" >&2
  exit 1
fi

app_dir=/www/server/pointking-app
new_dir="/www/server/pointking-app.new-$release_id"
backup_dir="/www/server/pointking-app.backup-$release_id"
data_dir=/www/wwwroot/pointking-live-data
nginx_site=/www/server/nginx/conf/nginx.conf
nginx_include_dir=/www/server/nginx/conf/includes
nginx_include="$nginx_include_dir/pointking-live.conf"
nginx_backup="/www/server/nginx/conf/nginx.conf.backup-$release_id"

if [[ -e "$new_dir" || -e "$backup_dir" ]]; then
  echo "Refusing to overwrite an existing PointKing deployment staging or backup directory" >&2
  exit 1
fi

mkdir -p "$new_dir"
tar -xzf /tmp/pointking-live-deploy.tar.gz -C "$new_dir"
chown -R root:root "$new_dir"
chmod -R u=rwX,go=rX "$new_dir"

if [[ -e "$app_dir" ]]; then
  mv "$app_dir" "$backup_dir"
fi
mv "$new_dir" "$app_dir"

mkdir -p "$data_dir"
chown www:www "$data_dir"
chmod 750 "$data_dir"

install -m 0644 /tmp/pointking.service /etc/systemd/system/pointking.service
mkdir -p "$nginx_include_dir"
install -m 0644 /tmp/pointking-nginx.conf "$nginx_include"

if ! grep -qF "include $nginx_include;" "$nginx_site"; then
  cp -a "$nginx_site" "$nginx_backup"
  sed -i "\|^[[:space:]]*location / {|i\\        include $nginx_include;" "$nginx_site"
fi

nginx -t
systemctl daemon-reload
systemctl enable pointking.service
systemctl restart pointking.service
for attempt in {1..20}; do
  if curl --fail --silent http://127.0.0.1:18081/ >/dev/null; then
    break
  fi
  if [[ "$attempt" -eq 20 ]]; then
    echo "PointKing did not become healthy after restart" >&2
    exit 1
  fi
  sleep 0.5
done
nginx -s reload

systemctl --no-pager --full status pointking.service | sed -n '1,14p'
echo "POINTKING_DEPLOY_OK"
