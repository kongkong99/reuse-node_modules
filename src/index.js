const execa = require('execa'); // sync, commandSync, command, node
const fs = require('fs-extra');
const { type } = require('os');
const path = require('path');
const log = require('./log');


function joinCwdPath(...paths) {
  return path.join(process.cwd(), ...paths);
}

// 获取当前项目packages
let packageJSON = require(joinCwdPath('package.json'));


// 计算当前packages中依赖项
const packages = {};
['dependencies', 'devDependencies'].forEach((item) => {
  Object.assign(packages, packageJSON[item]);
});

log.info('项目package.json内容获取成功');


async function computedPackages() {

  const viewNames = Object.keys(packages).filter((name) => packages[name].startsWith("~") || packages[name].startsWith("^"));

  // npm view <packageName>@'>1.0.0' version 查到的值数组即为逆序，符合预期顺序
  let npmVersions = (await Promise.all(
    viewNames.map((name) => {
      log.info(`npm view ${name}@${'>=' + packages[name].slice(1)} version --json`);
      return execa.command(`npm view ${name}@${'>=' + packages[name].slice(1)} version --json`);
    })
  )).map((item) => JSON.parse(item.stdout));


  // 通过当前版本与全量版本比较
  function versionCompare(value, versions, type) {
    if (!Array.isArray(versions)) return versions;

    let prefix = [...value.matchAll(/\d+\.(?=\d+\..+)/g)][0][0];
    if (type === 'minor') prefix = [...value.matchAll(/\d+\.\d+\.(?=.+)/g)][0][0];

    const version = versions.find((item) => item.startsWith(prefix));
    return version;
  }

  viewNames.forEach((name, index) => {
    let value = packages[name];
    if (value.startsWith("~")) value = versionCompare(value, npmVersions[index], 'patch');
    else if (value.startsWith("^")) value = versionCompare(value, npmVersions[index], 'minor');

    packages[name] = value;
  });

}


async function start() {
  const { stdout: projectName } = execa.commandSync(`basename  ${joinCwdPath()}`);
  const storeDirPath = joinCwdPath('../', projectName + 'Store');
  log.info(`last node_modules的目录: ${storeDirPath}`);

  try {
    const storeJSONPath = path.join(storeDirPath, 'modules.json'); // 存储的依赖项json
    const storeModulesPath = path.join(storeDirPath, 'node_modules'); // 存储的依赖项modules
    if (!fs.pathExistsSync(storeJSONPath)
      || !fs.pathExistsSync(storeModulesPath)) {
      throw new Error('not exist last node_modules');
    }

    if (fs.pathExistsSync(joinCwdPath('package-lock.json'))) {
      log.info('exist package-lock.json');

      const locks = {};
      const lockJSON = require(joinCwdPath('package-lock.json'));
      ['dependencies', 'devDependencies'].forEach((item) => {
        Object.assign(locks, lockJSON[item]);
      });
      Object.keys(packages).forEach(item => {
        packages[item] === locks[item]?.version || packages[item];
      });
    } else {
      await computedPackages();
    }

    // 此时packages内容为安装的最终版本
    const storePackages = fs.readJsonSync(storeJSONPath);
    if (Object.keys(packages).every((item) => storePackages[item] === packages[item])) {
      // 前后两次包完全一样
      // shell 移动node_modules, npm run build
      // shell 将node_modules移入存储空间
      execa.commandSync(`mv ${storeModulesPath} ${joinCwdPath()}`);
      log.success('Same as last node_modules');
      return;

    } else {
      // 前后两次包不一样，shell执行npm i, npm run build
      throw new Error('Different from last node_modules');
    }

  } catch (error) {
    log.warning(`${String(error).slice(7)}, doing npm install`);
    fs.emptyDir(storeDirPath);
    // 将本次依赖packagesJSON写入本目录下modules.json
    fs.writeJson(joinCwdPath('./modules.json'), packages);
    execa.commandSync('npm install');
    // await execa('npm', ['install',], { cwd: joinCwdPath() });
  }


}

start();



