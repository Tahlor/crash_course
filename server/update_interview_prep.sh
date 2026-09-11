#!/usr/bin/env bash
set -euo pipefail

REPO=/home/ubuntu/interview_prep_deploy
WEBROOT=/var/www/html/projects/interview_prep
VENV=/home/ubuntu/.venvs/interview_prep
LOCK=/tmp/interview-prep-deploy.lock

exec 9>"$LOCK"
flock -n 9 || exit 0

export GIT_SSH_COMMAND='ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new'

if [[ ! -d "$REPO/.git" ]]; then
  rm -rf "$REPO"
  git clone git@github.com:Tahlor/interview_prep.git "$REPO"
fi

cd "$REPO"
git fetch origin master
git reset --hard origin/master

if [[ ! -x "$VENV/bin/python" ]]; then
  mkdir -p "$(dirname "$VENV")"
  python3 -m venv "$VENV"
fi

"$VENV/bin/pip" install -q -r requirements.txt
"$VENV/bin/mkdocs" build --clean
mkdir -p "$WEBROOT"
rsync -a --delete site/ "$WEBROOT/"
printf 'deployed %s\n' "$(git rev-parse HEAD)"
