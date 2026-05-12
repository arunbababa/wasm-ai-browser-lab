import http from "node:http";

const listenPort = Number(process.argv[2] || 8976);
const targetPort = Number(process.argv[3] || 8988);
const listenHost = process.argv[4] || "127.0.0.1";

const server = http.createServer((request, response) => {
  if (!request.url?.startsWith("/oauth/callback")) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Waiting for Wrangler OAuth callback.");
    return;
  }

  const proxy = http.request(
    {
      hostname: "127.0.0.1",
      port: targetPort,
      path: request.url,
      method: request.method,
      headers: request.headers,
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode ?? 200, proxyResponse.headers);
      proxyResponse.pipe(response);
      proxyResponse.on("end", () => {
        setTimeout(() => server.close(), 1000);
      });
    },
  );

  proxy.on("error", (error) => {
    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Failed to forward OAuth callback: ${error.message}`);
  });

  request.pipe(proxy);
});

server.listen(listenPort, listenHost, () => {
  console.log(`Forwarding http://${listenHost}:${listenPort} -> http://127.0.0.1:${targetPort}`);
});
