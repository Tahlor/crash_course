#!/usr/bin/env bash
set -euo pipefail

REPO=/home/ubuntu/interview_prep_deploy
WEBROOT=/var/www/html/projects/interview_prep
VENV=/home/ubuntu/.venvs/interview_prep
LOCK=/tmp/interview-prep-deploy.lock
DEPLOY_TAG=archimedes-deployed

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

sha="$(git rev-parse HEAD)"
git tag -f "$DEPLOY_TAG" "$sha"
git push -f origin "refs/tags/$DEPLOY_TAG" >/dev/null 2>&1 || true
printf 'deployed %s\n' "$sha"
