const fs = require('fs-extra');
const path = require('path');
const execa = require('execa'); // sync, commandSync, command, node

function joinCwdPath(...paths) {
  console.log(44, path.join(process.cwd(), ...paths));
  return path.join(process.cwd(), ...paths);
}

console.log(33, joinCwdPath('/sdaf', '/asas'));;
// const lastPackages = fs.readJsonSync(joinCwdPath('/src/test.json'));
// console.log(33, lastPackages);

