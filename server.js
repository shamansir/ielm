const exitHook = require('exit-hook')

const ElmRepl = require('node-elm-repl');

const http = require('http')
const port = 3000

const requestHandler = (request, response) => {
  console.log(request.url)
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  response.setHeader('Access-Control-Allow-Methods', 'GET');
  response.setHeader('Access-Control-Allow-Headers', 'content-type');
  response.writeHead(200, {'Content-Type': 'text/json'});
  setTimeout(function() {
    response.end(JSON.stringify({ test: "true" }));
  });
}

const server = http.createServer(requestHandler)

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
