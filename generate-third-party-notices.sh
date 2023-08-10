PACKAGE_DIR=$(pwd)
REPO_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
echo "copying package $PACKAGE_DIR to $REPO_DIR/temp"
rm -rf "$REPO_DIR/temp"
cp -r $PACKAGE_DIR "$REPO_DIR/temp"
cd "$REPO_DIR/temp" && npm i
npx generate-license-file --input package.json --output THIRD-PARTY-NOTICES --overwrite
cp "$REPO_DIR/temp/THIRD-PARTY-NOTICES" $PACKAGE_DIR
rm -rf "$REPO_DIR/temp"