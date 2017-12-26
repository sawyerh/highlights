#!/bin/sh

set -e

RED="\033[0;31m"
GREEN='\033[0;32m'
BLUE="\033[0;34m ℹ "
NC='\033[0m' # No color

echo "${BLUE}Setting AWS_PROFILE...${NC}"
export AWS_PROFILE=highlights

echo "${BLUE}Clean up...${NC}"
trash ./dist
mkdir ./dist

echo "${BLUE}Copy files...${NC}"
cp ./*.{js,json,lock} ./dist
cp -R ./importer ./dist

echo "${BLUE}Install production dependencies...${NC}"
cd ./dist
yarn install --production
zip -X -r -q ../index.zip *
cd ..

echo "${BLUE}Update Lambda function...${NC}"
aws lambda update-function-code --function-name highlightsEmailToFirebase --zip-file fileb://index.zip