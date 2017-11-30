const cp = require('child_process');

const copy = require('recursive-copy');
const rimraf = require('rimraf');

const currentPath = process.cwd();
// TODO iElm npm path

const outputDirName = 'output';
const outputDir = `./${outputDirName}`;
const serverDir = './src/server';
const npmBinDir = './node_modules/.bin/';

const componentsDir = `${serverDir}/Component`;
const serverScript = `${serverDir}/server.js`;
const simpleHttpServerBin = `${npmBinDir}/node-simplehttpserver`;
const simpleHttpServerPort = 8080;
const webpackDevServerBin = `${npmBinDir}/webpack-dev-server`;
const elmPackageSource = `${serverDir}/elm-package.sample.json`;
const elmPackageDest = `${outputDir}/elm-package.json`;

function build() {
    // webpack
    return execInPromise('webpack');
}

function testBuild() {
    return cleanOutput()
        .then(createOutputDir)
        .then(quickTestBuild);
}

function quickTestBuild() {
    return build()
        .then(copyComponents)
        .then(copyElmPackage)
        .then(installPackages)
        .then(startServer)
        .then(startClient);
}

function createOutputDir() {
    // mkdir ./output
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
                resolve();
            } else {
                resolve();
            }
        } catch(e) {
            reject(e);
        }
    });
}

function cleanOutput() {
    // rm -Rf ./output
    return rimrafInPromise(outputDir);
}

function copyComponents() {
    // cp -R ./src/server/Component ./output
    return copy(componentsDir, outputDir);
}

function copyElmPackage() {
    // cp ./src/server/elm-package.sample.json ./output/elm-package.json
    return copy(elmPackageSource, elmPackageDest);
}

function installPackages() {
    // cd ./output && elm-package install --yes && cd ..
    return chdirInPromise(outputDir)
        .then(execInPromise('elm-package install --yes'))
        .then(chdirInPromise('..'));
}

function startServer() {
    // node ./src/server/server.js
    return execInPromise(`node ${serverScript}`);
}

function startClient() {
    // ./node_modules/.bin/node-simplehttpserver . 8080
    return execInPromise(`${simpleHttpServerBin} . ${simpleHttpServerPort}`);
}

function startDevClient() {
    // ./node_modules/.bin/webpack-dev-server
    return execInPromise(`${webpackDevServerBin}`);
}

function quickStart() {
    return copyComponents()
        .then(copyElmPackage)
        .then(installPackages)
        .then(startServer)
        .then(startDevClient);
}

function start() {
    return cleanOutput()
        .then(createOutputDir)
        .then(quickStart);
}

function test() {
    throw new Error("Error: no test specified");
}

function execInPromise(command) {
    return new Promise((resolve, reject) => {
        cp.exec(command, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

function chdirInPromise(path) {
    return new Promise((resolve, reject) => {
        try {
            process.chdir(path);
            resolve();
        } catch(e) {
            reject(e);
        }
    });
}

function rimrafInPromise(path) {
    return new Promise((resolve, reject) => {
        rimraf(path, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

function alwaysResolve(resolve) {
    resolve();
}
