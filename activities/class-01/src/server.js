const http = require('http');

const PORT = 3000;

const server = http.createServer((request, response) => {
  console.log(`${request.method} ${request.url}`);

  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bienvenido al servidor de la Clase 1');
    return;
  }

  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('OK');
    return;
  }

  if (request.url === '/api/info') {
    const info = {
      clase: 1,
      tema: 'Del clic a la respuesta',
      framework: 'Ninguno',
      runtime: 'Node.js'
    };
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(info));
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Ruta no encontrada');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
