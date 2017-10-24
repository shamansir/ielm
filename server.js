const exitHook = require('exit-hook')

const ElmRepl = require('node-elm-repl');

const http = require('http');
const port = 3000;

const fs = require('fs');
const cp = require('child_process');

const compile = (config, elmLines, moduleName) => {
  return new ElmRepl(config).parseLines(elmLines, moduleName)
}

const adaptConfig = (bodyJson) => {
  return {
    elmVer: bodyJson.elmVer || "0.18.0",
    user: bodyJson.user || "user",
    package: bodyJson.package || "project",
    packageVer: bodyJson.packageVer || "1.0.0",
    workDir: bodyJson.workDir || "./build",
  }
}

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

    if (request.url == '/compile') {
      try {

        // compile Elm Lines
        const bodyJson = JSON.parse(bodyStr)
        const elmReplConfig = adaptConfig(bodyJson);
        const elmLines = bodyJson.lines.split('\n');
        if (elmLines && elmLines.length) {
          compile(elmReplConfig, elmLines, 'Test').then((parsedModule) => {
            response.end(JSON.stringify(parsedModule));
          }).catch((err) => {
            response.end(JSON.stringify({ error: err.message }));
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
