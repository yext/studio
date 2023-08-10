WORKSPACES=$(json -f package.json workspaces)
json -I -f package.json -e 'this.workspaces=[]'
cd packages/studio
npm install
generate-license-file --input package.json --output THIRD-PARTY-NOTICES --overwrite
rm package-lock.json
cd ../studio-plugin
npm install
generate-license-file --input package.json --output THIRD-PARTY-NOTICES --overwrite
rm package-lock.json
cd ../..
json -I -f package.json -e "this.workspaces=${WORK}"