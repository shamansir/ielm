const exitHook = require('exit-hook')

const ElmRepl = require('node-elm-repl');

const http = require('http');
const port = 3000;

const fs = require('fs');
const cp = require('child_process');

const compile = (elmLines, moduleName) => {
  return new ElmRepl({
    elmVer: '0.18.0',
    workDir: '.'
  }).parseLines(elmLines, moduleName)
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

      // compile Elm Lines
      const elmLines = bodyStr.split('\n');
      if (elmLines && elmLines.length) {
        compile(elmLines, 'Test').then((parsedModule) => {
          response.end(JSON.stringify(parsedModule));
        }).catch((err) => {
          response.end(JSON.stringify({ error: err.message }));
        });
      } else {
        response.end(JSON.stringify({ error: "Empty Body" }));
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
