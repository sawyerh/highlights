#!/bin/sh

set -e

GREEN='\033[0;32m'
NC='\033[0m' # No color

echo "${GREEN}Clean up...${NC}"
trash ./dist
mkdir ./dist

echo "${GREEN}Copy files...${NC}"
cp ./*.{js,json,lock} ./dist
cp -R ./importer ./dist

echo "${GREEN}Install production dependencies...${NC}"
cd ./dist
yarn install --production