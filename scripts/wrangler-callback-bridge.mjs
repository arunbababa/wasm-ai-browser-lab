import http from "node:http";
import { spawn } from "node:child_process";

const port = Number(process.argv[2] || process.env.WRANGLER_CALLBACK_PORT || 8976);
const host = "127.0.0.1";

const server = http.createServer((request, response) => {
  if (!request.url?.startsWith("/oauth/callback")) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not a Wrangler OAuth callback.");
    return;
  }

  const target = `http://127.0.0.1:${port}${request.url}`;
  const curl = spawn("wsl", ["curl", "-sS", target], {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  let stdout = "";
  let stderr = "";
  curl.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  curl.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  curl.on("close", (code) => {
    if (code === 0) {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(`
        <!doctype html>
        <title>Wrangler login forwarded</title>
        <body style="font-family: system-ui; padding: 40px;">
          <h1>Cloudflare login forwarded to WSL</h1>
          <p>You can close this tab and return to Codex.</p>
          <pre>${escapeHtml(stdout)}</pre>
        </body>
      `);
      setTimeout(() => server.close(), 1000);
      return;
    }

    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Failed to forward callback to WSL.\n\n${stderr || stdout}`);
  });
});

server.listen(port, host, () => {
  console.log(`Wrangler callback bridge listening on http://${host}:${port}`);
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
