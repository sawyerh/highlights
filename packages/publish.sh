###
# Publishes all packages in the packages/directory
# Learn more ./publish.sh --help
###
if [ "$1" == "--help" ]; then
  echo "
    Publishes all packages in the packages/ directory.
    A failure will occure if a package version is already published,
    but this doesn't prevent the other packages from being published.

    Usage: ./publish.sh [--no-dry-run]

    --no-dry-run: Publishes all packages
    --help: Prints this message
  "
  exit 0
fi

for dir in */; do
  echo "\033[0;33m===================================="
  echo "Running npm publish in $dir"
  echo "\033[0;33m===================================="
  cd $dir

  if [ "$(npm whoami)" != "sawyerh" ]; then
    echo "You must be logged in as sawyerh to publish packages"
    exit 1
  fi

  if [ "$1" == "--no-dry-run" ]; then
    npm publish
  else
    npm publish --dry-run
  fi

  cd ..
done