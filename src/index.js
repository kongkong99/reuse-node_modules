const execa = require('execa'); // sync, commandSync, command, node

let packageJSON = require('../package.json');


try {
  const locks = {};
  const lockJSON = require('../package-lock.json');
  ['dependencies', 'devDependencies'].forEach((item) => {
    Object.assign(locks, lockJSON[item]);
  });
  console.log('lock', locks);
  return locks;
} catch (error) {

}


async function compare() {

  const packages = {};
  ['dependencies', 'devDependencies'].forEach((item) => {
    Object.assign(packages, packageJSON[item]);
  });

  const viewNames = Object.keys(packages).filter((name) => packages[name].startsWith("~") || packages[name].startsWith("^"));

  // npm view查到的值即为逆序，符合预期顺序
  let npmVersions = (await Promise.all(
    viewNames.map((name) => execa.commandSync(`npm view ${name}@${'>=' + packages[name].slice(1)} version --json`))
  )).map((item) => JSON.parse(item.stdout));

  console.log(22, npmVersions);


  // ~小版本比较
  function patchCompare(name, versions) {
    // todo package(name) 也在versions中，是否可以 按照位置，进行比对
    const nameArray = [...package(name).match(/(\d+)\.(\d+)\.(.+)/g)][0].slice(1); // ['1', '10', '9']

    versions.some((version) => {

    });
  }

  // ^大版本比较
  function minorCompare(name, versions) {


    return;
  }
  viewNames.forEach((name, index) => {
    if (name.startsWith("~")) packages[name] = patchCompare(name, npmVersions[index]);
    if (name.startsWith("^")) packages[name] = minorCompare(name, npmVersions[index]);
  });
}

compare();;
