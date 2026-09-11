#!/usr/bin/env bash
set -euo pipefail

SOURCE="$(cd "$(dirname "$0")" && pwd)/update_interview_prep.sh"
DEST=/home/ubuntu/update_interview_prep.sh
LOG=/home/ubuntu/interview_prep_deploy.log
CRON='*/5 * * * * /home/ubuntu/update_interview_prep.sh >> /home/ubuntu/interview_prep_deploy.log 2>&1'

install -m 0755 "$SOURCE" "$DEST"

current="$(crontab -l 2>/dev/null || true)"
if ! grep -Fq '/home/ubuntu/update_interview_prep.sh' <<<"$current"; then
  { printf '%s\n' "$current"; printf '%s\n' "$CRON"; } | awk 'NF' | crontab -
fi

nohup "$DEST" >> "$LOG" 2>&1 </dev/null &
