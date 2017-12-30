#!/bin/sh

# This file copies the files into dist/ and builds the dependencies
# within the Lambda Node environment

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
npm install --production --quiet

# Necessary because Firestore relies on gprc dependency
# stackoverflow.com/questions/46775815/node-v57-linux-x64-grpc-node-node-missing
echo "${BLUE}Compile native deps within Lambda environment...${NC}"
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs6.10