#!/bin/sh

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
cp -R ./importer ./dist

echo "${BLUE}Install production dependencies...${NC}"
cd ./dist
yarn install --production
zip -X -r -q ../handler.zip *
cd ..