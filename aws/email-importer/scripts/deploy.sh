#!/bin/sh

set -e

RED="\033[0;31m"
GREEN='\033[0;32m'
BLUE="\033[0;34m ℹ "
NC='\033[0m' # No color

./scripts/compile.sh

cd ./dist

echo "${BLUE}Zip package..."
zip -X -r -q ../index.zip *
cd ..

echo "${BLUE}Update Lambda function...${NC}"
export AWS_PROFILE=sawyer-lambda
aws s3 cp index.zip s3://sawyer-lambda/highlightsEmailToFirebase/index.zip
aws lambda update-function-code --function-name highlightsEmailToFirebase --s3-bucket sawyer-lambda --s3-key highlightsEmailToFirebase/index.zip