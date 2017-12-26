#!/bin/sh

set -e

RED="\033[0;31m"
GREEN='\033[0;32m'
BLUE="\033[0;34m"
NC='\033[0m' # No color

if npm whoami | grep sawyerh -v
then
  echo "${RED}✘ Not logged in as correct NPM user"
  exit 0
fi

./node_modules/.bin/lerna publish