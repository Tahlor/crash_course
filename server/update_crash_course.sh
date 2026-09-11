#!/usr/bin/env bash
set -euo pipefail

REPO=/home/ubuntu/crash_course_deploy
WEBROOT=/var/www/html/projects/crash_course
SERVICE=crash-course-state.service

cd "$REPO"
old_api_hash="$(sha256sum server/state_api.py 2>/dev/null | awk '{print $1}' || true)"
git fetch origin master
git reset --hard origin/master
python3 -m py_compile server/state_api.py
new_api_hash="$(sha256sum server/state_api.py | awk '{print $1}')"
rsync -a --delete --exclude '.git/' ./ "$WEBROOT/"

if [[ "$old_api_hash" != "$new_api_hash" ]] && systemctl is-enabled "$SERVICE" >/dev/null 2>&1; then
  sudo -n systemctl restart "$SERVICE"
fi
