#!/bin/sh

# This file installes and copies production files into dist/

set -e

RED="\033[0;31m"
GREEN='\033[0;32m'
BLUE="\033[0;34m ℹ "
NC='\033[0m' # No color

echo "${BLUE}Clean up...${NC}"
trash ./dist
mkdir ./dist

echo "${BLUE}Copy files...${NC}"
cp ./*.{js,json,lock} ./dist

echo "${BLUE}Install production dependencies...${NC}"
cd ./dist
yarn install --production --silent