#!/bin/bash

# Automatically update tools/console_version in ../omicron with current console
# commit hash and tarball hash. Then create PR in Omicron with that change.
#
# Requirements/assumptions:
#
# - GitHub CLI
# - Omicron is a sibling dir to console

set -o errexit
set -o pipefail

if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI not found. This script needs it to create a PR. Please install it and try again."
  exit
fi

if [ ! -d "../omicron" ]; then
  echo "Error: This script assumes omicron shares a parent directory with console."
  exit
fi

# note that this will fail unless the current console commit has a release on
# dl.oxide.computer, i.e., it is a commit on main that has been pushed to GH.
NEW_CONSOLE_VERSION=$(git rev-parse HEAD)
# short hash used in branch name to avoid collisions
NEW_CONSOLE_VERSION_SHORT=$(git rev-parse --short HEAD)
NEW_SHA2=$(curl --fail-with-body "https://dl.oxide.computer/releases/console/$NEW_CONSOLE_VERSION.sha256.txt")

cd ../omicron
git checkout main
git pull
git checkout -b "bump-console-$NEW_CONSOLE_VERSION_SHORT"

# set COMMIT and SHA2 to old values so we can use COMMIT in the PR body
source tools/console_version

cat <<EOF > tools/console_version
COMMIT="$NEW_CONSOLE_VERSION"
SHA2="$NEW_SHA2"
EOF

TITLE="Bump console to latest main"
BODY="Changes: https://github.com/oxidecomputer/console/compare/$COMMIT...$NEW_CONSOLE_VERSION"

git add --all
git commit -m "$TITLE" -m "$BODY"
gh pr create --title "$TITLE" --body "$BODY"
