const fs = require('fs');
const cpp = require('child-process-promise');
const copy = require('recursive-copy');
const rimraf = require('rimraf');

const currentPath = process.cwd();
// TODO iElm npm path

let commandToRun = 'run';
if (process.argv && process.argv.length) {
    process.argv.forEach((arg) => {
        if ((arg === 'build') ||
            (arg === 'run') ||
            (arg === 'quick-run') ||
            (arg === 'run-dev') ||
            (arg === 'quick-run-dev')) {
                commandToRun = arg;
            }
    })
}

console.log(`:: ${commandToRun}`);

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
const componentsDest = `${outputDir}/Component`;

function build() {
    // webpack
    return execInPromise('webpack');
}

function run() {
    return cleanOutput()
        .then(createOutputDir)
        .then(quickRun);
}

function quickRun() {
    return build()
        .then(copyComponents)
        .then(copyElmPackage)
        .then(installPackages)
        .then(() => {
            return Promise.all([ startServer(), startClient() ]);
        });
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
    }).then(() => {
        console.log(`:: output directory was cleaned.`);
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
    return copy(elmPackageSource, elmPackageDest, { overwrite: true });
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
    console.log(':: start server.');
    return execInPromise('node', [ serverScript ]);
}

function startClient() {
    // ./node_modules/.bin/node-simplehttpserver . 8080
    console.log(':: start client.');
    return execInPromise(simpleHttpServerBin, [ '.', simpleHttpServerPort ]);
}

function startDevClient() {
    // ./node_modules/.bin/webpack-dev-server
    console.log(':: start development client.');
    return execInPromise(webpackDevServerBin);
}

function quickRunDev() {
    return copyComponents()
        .then(copyElmPackage)
        .then(installPackages)
        .then(() => {
            return Promise.all([ startServer(), startDevClient() ]);
        });
}

function runDev() {
    return cleanOutput()
        .then(createOutputDir)
        .then(quickRunDev);
}

function test() {
    throw new Error("Error: no test specified");
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
} else if (commandToRun === 'quick-run') {
    quickRun();
} else if (commandToRun === 'run-dev') {
    runDev();
} else if (commandToRun === 'quick-run-dev') {
    quickRunDev();
}
