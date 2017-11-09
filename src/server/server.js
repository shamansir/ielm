const exitHook = require('exit-hook')

const ElmRepl = require('node-elm-repl');

const http = require('http');
const port = 3000;

const fs = require('fs');
const cp = require('child_process');

// REVL means Read-Evaluate-Visualize-Loop
const RevlDocument = require('./document.js');
const revlDocument = new RevlDocument();

const compile = (config, elmLines, moduleName) => {
  return new ElmRepl(config).parseModuleText(elmLines, moduleName)
}

const adaptConfig = (bodyJson) => {
  return {
    elmVer: bodyJson.elmVer || "0.18.0",
    user: bodyJson.user || "user",
    package: bodyJson.package || "project",
    packageVer: bodyJson.packageVer || "1.0.0",
    workDir: bodyJson.workDir || "./build"
  }
}

const versions = []; // Screen ID to version

const requestHandler = (request, response) => {

  let requestBody = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    requestBody.push(chunk);
  }).on('end', () => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    response.setHeader('Access-Control-Allow-Headers', 'content-type');
    response.writeHead(200, {'Content-Type': 'text/json'});

    const bodyStr = Buffer.concat(requestBody).toString();

    if (request.url == '/refresh') {
      revlDocument.refresh();
    }

    if (request.url == '/compile') {
      try {

        // compile Elm Lines
        const bodyJson = JSON.parse(bodyStr)
        const elmReplConfig = adaptConfig(bodyJson);
        const screenId = bodyJson.screenId;
        const screenContent = bodyJson.document;
        const initialDir = process.cwd();

        const prevVersion = versions[screenId] || 0;
        const version = prevVersion + 1;

        const prevModuleName = `Screen${screenId}_v${prevVersion}`;
        const moduleName = `Screen${screenId}_v${version}`;

        if (screenContent) {
          revlDocument.append(screenId, screenContent);
          compile(
            elmReplConfig,
            revlDocument.buildPreludeFor(screenId),
            'Prelude'
          ).then(function(preludeJson) {
            const cellCount = revlDocument.getCellCount(screenId);
            process.chdir(elmReplConfig.workDir);

            const prevScreenElmFileName = `./${prevModuleName}.elm`;
            const prevScreenJsFileName = `./${prevModuleName}.js`;
            if (fs.existsSync(prevScreenElmFileName)) {
              fs.unlinkSync(prevScreenElmFileName);
            };
            if (fs.existsSync(prevScreenJsFileName)) {
              fs.unlinkSync(prevScreenJsFileName);
            };

            const screenElmFileName = `./${moduleName}.elm`;
            const screenJsFileName = `./${moduleName}.js`;
            fs.writeFileSync(screenElmFileName,
              revlDocument.buildScreenFor(screenId, moduleName, preludeJson.types)
            );
            cp.execSync('elm-make --yes ' + screenElmFileName + ' --output ' + screenJsFileName,
                { cwd: process.cwd() });
            return {
              'version': version,
              'cellCount': cellCount
            };
          }).then((viewerInfo) => {
            response.end(JSON.stringify(viewerInfo));
          }).catch((err) => {
            response.end(JSON.stringify({ error: err.message }));
          }).then(() => { // a.k.a. finally
            process.chdir(initialDir);
            versions[screenId] = version; // FIXME: do it only if everything was successful
          });
        } else {
          response.end(JSON.stringify({ error: "Empty Body" }));
        }

      } catch(err) {
        response.end(JSON.stringify({ error: "Failed to parse request body: " + err.message }));
      }
    } else {
      response.end(JSON.stringify({ error: "Unknown request: " + request.url }));
    }

  });

}

const server = http.createServer(requestHandler);

exitHook(() => {
  server.close();
})

process.on('uncaughtException', () => {
  server.close();
});

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
