#!/bin/sh

set -e

./scripts/compile.sh

cd ./dist

docker run --env-file ../.env -v "$PWD":/var/task lambci/lambda:nodejs8.10 index.handler '{"Records":[{"ses":{"mail":{"messageId":"mbkh4k49g9esmvvio3n01ln64n2acppercpq37o1"}}}]}'