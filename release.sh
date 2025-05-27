#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the current version from package.json
VERSION=$(grep -oP '"version": "\K[0-9]+\.[0-9]+\.[0-9]+' package.json)

# Create a new git tag with the version
git tag -a "v$VERSION" -m "Release version $VERSION"

# Push the new tag to the remote repository
git push origin "v$VERSION"

# Create a new release on GitHub
gh release create "v$VERSION" --title "Release v$VERSION" --notes "Automated release of version $VERSION"

# Execute the release script
./release.sh
