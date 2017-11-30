const currentDir = process.cwd();

function build() {
    // webpack
    return new Promise(alwaysResolve);
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
    return new Promise(alwaysResolve);
}

function cleanOutput() {
    // rm -Rf ./output
    return new Promise(alwaysResolve);
}

function copyComponents() {
    // cp -R ./src/server/Component ./output
    return new Promise(alwaysResolve);
}

function copyElmPackage() {
    // cp ./src/server/elm-package.sample.json ./output/elm-package.json
    return new Promise(alwaysResolve);
}

function installPackages() {
    // cd ./output && elm-package install --yes && cd ..
    return new Promise(alwaysResolve);
}

function startServer() {
    // node ./src/server/server.js
    return new Promise(alwaysResolve);
}

function startClient() {
    // ./node_modules/.bin/node-simplehttpserver . 8080
    return new Promise(alwaysResolve);
}

function startDevClient() {
    // ./node_modules/.bin/webpack-dev-server
    return new Promise(alwaysResolve);
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

function alwaysResolve(resolve) {
    resolve();
}
