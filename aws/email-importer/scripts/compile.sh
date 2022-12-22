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
cp -R ./importMail ./dist

echo "${BLUE}Install production dependencies...${NC}"
cd ./dist
yarn install --production --silent

echo "${BLUE}Copy local dependencies...${NC}"
# Copy local dependency (symlinks don't seem to work in Docker)
cp -R ../../firestore-highlights ./node_modules/@sawyerh

# Necessary because Firestore relies on gprc dependency
# https://stackoverflow.com/questions/46775815/node-v57-linux-x64-grpc-node-node-missing
echo "${BLUE}Compile native deps within Lambda environment...${NC}"
npm rebuild --target=16.0.0 --target_platform=linux --target_arch=x64 --target_libc=glibc --update-binary