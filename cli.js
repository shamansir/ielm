const fs = require('fs');
const cpp = require('child-process-promise');
const copy = require('recursive-copy');
const rimraf = require('rimraf');
const modulePath = require('npm-module-path');

const userDirectory = process.cwd();

let runLocally = false;
let commandToRun = 'run';
if (process.argv && process.argv.length) {
    process.argv.forEach((arg) => {
        if ((arg === 'build') ||
            (arg === 'run') ||
            (arg === 'quick-run') ||
            (arg === 'run-dev') ||
            (arg === 'quick-run-dev') ||
            (arg === 'test')) {
                commandToRun = arg;
            };
        if (arg === 'local') {
            runLocally = true;
        }
    })
}

console.log(`:: ${commandToRun}`);

const outputDirName = 'output';
const outputDir = `./${outputDirName}`;
const serverDir = './src/server';
const npmBinDir = './node_modules/.bin/';

const ielmBinary = './ielm.js';
const componentsDir = `${serverDir}/Component`;
const serverScript = `${serverDir}/server.js`;
const simpleHttpServerBin = `${npmBinDir}/node-simplehttpserver`;
const simpleHttpServerPort = 8080;
const webpackDevServerBin = `${npmBinDir}/webpack-dev-server`;
const elmPackageSource = `${serverDir}/elm-package.sample.json`;
const elmPackageDest = `${outputDir}/elm-package.json`;
const componentsDest = `${outputDir}/Component`;

const inModuleDir = false;

function build() {
    // webpack
    return goToModuleDir()
        .then(execInPromise('webpack'))
        .then(goBackToOriginalDir);
}

function cleanRun() {
    return goToModuleDir()
        .then(cleanOutput)
        .then(quickRun);
}

function run() {
    return goToModuleDir()
        .then(buildIfNotExists)
        .then(createOutputDir)
        .then(copyComponents)
        .then(copyElmPackage)
        .then(installPackages)
        .then(() => {
            return Promise.all([ startServer(), startClient() ]);
        })
        .then(goBackToOriginalDir);
}

function goToModuleDir() {
    return (inModuleDir || runLocally)
        ? Promise.resolve()
        : modulePath.resolveOne('ielm').then((ielmModulePath) => {
            inModuleDir = true;
            console.log(`:: iElm module path: ${ielmModulePath}`);
            return chdirInPromise(ielmModulePath);
        }).catch(() => {
            return Promise.resolve();
        })
}

function goBackToOriginalDir() {
    return chdirInPromise(userDirectory);
}

function createOutputDir() {
    // mkdir ./output
    console.log(':: create output directory.');
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            resolve();
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
    console.log(':: copy components.');
    return copy(componentsDir, componentsDest, { overwrite: true });
}

function copyElmPackage() {
    // cp ./src/server/elm-package.sample.json ./output/elm-package.json
    console.log(':: copy elm-package.json.');
    const sample = require(elmPackageSource);

    if (!sample['source-directories']) sample['source-directories'] = [];
    sample['source-directories'].push(userDirectory);

    let sourceDependencies = sample.dependencies;
    let userDependencies = {};
    try {
        userDependencies = require(`${userDirectory}/elm-package.json`).dependencies || {};
    } catch(e) {}
    Object.keys(userDependencies).forEach((dependencyName) => {
        sourceDependencies[dependencyName] = userDependencies[dependencyName];
    });

    return new Promise((resolve, reject) => {
        fs.writeFile(elmPackageDest, JSON.stringify(sample, null, '\t'), 'utf8', (err) => {
            if (!err) {
                resolve();
            } else {
                reject(err);
            }
        });
    });
}

function installPackages() {
    // cd ./output && elm-package install --yes && cd ..
    return chdirInPromise(outputDir)
        .then(() => { console.log(':: install Elm packages.'); })
        .then(execInPromise('elm-package', [ 'install', '--yes' ]))
        .then(chdirInPromise('..'));
}

function startServer() {
    // node ./src/server/server.js
    console.log(':: start server at http://localhost:3000.');
    return execInPromise('node', [ serverScript ]);
}

function startClient() {
    // ./node_modules/.bin/node-simplehttpserver . 8080
    console.log(':: start client at http://localhost:8080.');
    return execInPromise(simpleHttpServerBin, [ '.', simpleHttpServerPort ]);
}

function startDevClient() {
    // ./node_modules/.bin/webpack-dev-server
    console.log(':: start development client at http://localhost:8080.');
    return execInPromise(webpackDevServerBin);
}

function runDev() {
    return goToModuleDir()
        .then(createOutputDir)
        .then(copyComponents)
        .then(copyElmPackage)
        .then(installPackages)
        .then(() => {
            return Promise.all([ startServer(), startDevClient() ]);
        })
        .then(goBackToOriginalDir);
}

function cleanRunDev() {
    return goToModuleDir()
        .then(cleanOutput)
        .then(quickRunDev);
}

function test() {
    throw new Error("Error: no test specified");
}

function buildIfNotExists() {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(ielmBinary)) {
                return build();
            }
            resolve();
        } catch(e) {
            reject(e);
        }
    });
}

function execInPromise(command, args) {
    //console.log(`:: execute '${command}' with arguments: '${args}'.`);
    const promise = cpp.spawn(command, args || []);
    const childProcess = promise.childProcess;
    childProcess.stdout.on('data', function (data) {
        //console.log(`${command} :: ${data.toString()}`);
    });
    childProcess.stderr.on('data', function (data) {
        console.log(`${command} error :: ${data.toString()}`);
    });
    return promise;
}

function chdirInPromise(path) {
    return new Promise((resolve, reject) => {
        try {
            //console.log(`:: change directory to '${path}'.`);
            process.chdir(path);
            resolve();
        } catch(e) {
            reject(e);
        }
    });
}

function rimrafInPromise(path) {
    return new Promise((resolve, reject) => {
        console.log(`:: clean '${path}'.`);
        rimraf(path, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

if (commandToRun === 'build') {
    build();
} else if (commandToRun === 'run') {
    run();
} else if (commandToRun === 'clean-run') {
    cleanRun();
} else if (commandToRun === 'run-dev') {
    runDev();
} else if (commandToRun === 'clean-run-dev') {
    cleanRunDev();
} else if (commandToRun === 'test') {
    test();
}
