#!/bin/bash

# Step 0: If any command fails, stop the script
set -e

# Step 1: Navigate to the adjacent folder
cd ../ape-portal || exit
# Step 2: Ensure the git directory is clean

if [[ $(git status --porcelain 2> /dev/null) ]]; then
  echo "Error: Git directory is dirty. Please use a clean git directory for updating ape-portal-public."
  exit 1
else
  echo "Git directory is clean. Proceeding with the update."
fi

# Step 3: Ensure yq is installed for updating the ci.yml file
if ! command -v yq &> /dev/null; then
    echo "yq is not installed. Would you like to install it using Homebrew? (y/n)"
    read -r answer
    if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
        brew install yq
        echo "yq has been installed."
    else
        echo "Please install yq to proceed."
        exit 1
    fi
else
    echo "yq is already installed."
fi
# Step 4: Get the latest git tag
release_tag=$(git describe --tags --abbrev=0)
echo "Release tag in ape-portal: $release_tag"

# Step 5: Navigate back to the original folder
cd - || exit
current_dir=$(pwd)
echo "Current directory: $current_dir"

# Step 6: Copy the files from the source to the destination (use --dry-run to test)
echo "About to transfer the files from the source to the destination."
rsync -av --exclude-from="../ape-portal/.gitignore" --exclude=".git" --exclude=".husky" "../ape-portal/" .

# Step 7: Update the package.json file to reflect several changes for public repo publishing

# In package.json, Change URL from github.com/yuga-labs/ape-portal.git to github.com/yuga-labs/ape-portal-public.git"
sed -i '' 's/github.com\/yuga-labs\/ape-portal.git/github.com\/yuga-labs\/ape-portal-public.git/g' package.json

# Change the publish step for 'Publish to GitHub Packages' to public access, add npm token
yq eval '
  (.jobs.publish.steps[] | select(.name == "Publish to GitHub Packages") | .run) = "npm publish --access public --@yuga-labs:registry=https://npm.pkg.github.com/"
' -i .github/workflows/publish.yaml

# Step 8: Install the dependencies
npm install

# Step 9: Update the ci.yml file to remove the badge step
#  - the badge is generated in the private repository, and part of the README.
yq -i 'del( .jobs.test.steps[] | select(.name == "*Badge*" ) )' .github/workflows/ci.yml

# Step 10: Update the publish.yml file to remove the 'Update version' step
#  - the version in package.json/package-lock.json was already updated upstream.
yq -i 'del( .jobs.publish.steps[] | select(.name == "*Update version*" ) )' .github/workflows/publish.yaml

# Step 11: Commit the changes with the release tag
git add .
git commit -m "Release $release_tag"
git push origin main  # or the relevant branch name

# Step 12: Create tag with release tag
git tag "$release_tag"
git push origin "$release_tag"

echo "Transfer complete 🎉"
