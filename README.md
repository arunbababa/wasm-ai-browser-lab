# WASM AI Browser Lab

A tiny dependency-free browser demo that runs an AI-like scoring model in
WebAssembly. The model is intentionally small so it loads instantly and can be
deployed as plain static files.

## What It Shows

- Browser-only WebAssembly inference
- Three exported WASM score functions: `score_calm`, `score_build`,
  `score_explore`
- UI sliders that update the input vector
- Ranked model output, confidence, raw scores, runtime, and load source
- Generated-byte fallback if the `.wasm` asset cannot be fetched

## Run In WSL

```bash
cd ~/Dev/wasm-ai-browser-lab
npm run check
npm run dev
```

Open:

```text
http://localhost:5173
```

## Project Scripts

```bash
npm test
```

Runs the Node test suite.

```bash
npm run build:wasm
```

Writes `public/tiny-infer.wasm` from the local bytecode builder.

```bash
npm run build
```

Writes the WASM file and copies only deployable static assets into `dist/`.

```bash
npm run check
```

Runs tests and regenerates the WASM asset.

```bash
npm run dev
```

Regenerates the WASM asset and serves the static app on port `5173`.

## Cheap Deployment

### Cloudflare Pages

Cloudflare Pages is the easiest cheap path for this shape of app because it is
static HTML, CSS, JS, and WASM.

Suggested settings:

```text
Build command: npm run build
Build output directory: dist
Root directory: /
```

The app does not need Pages Functions, Workers, a server, or an API key for the
demo itself.

### GitHub Pages

GitHub Pages also works for this app.

Suggested flow:

```bash
npm run check
CLOUDFLARE_ACCOUNT_ID=<ACCOUNT_ID> CLOUDFLARE_API_TOKEN=<TOKEN> \
  wrangler pages deploy dist --project-name=wasm-ai-browser-lab --branch=main
```

Or after `wrangler login` succeeds:

```bash
npm run build
wrangler pages deploy dist --project-name=wasm-ai-browser-lab --branch=main
```

### GitHub Pages

GitHub Pages also works for this app.

Suggested flow:

```bash
npm run check
git add .
git commit -m "feat: add wasm ai browser lab"
git push
```

Then enable GitHub Pages for the repository and publish from the branch/root, or
use a GitHub Actions workflow that runs `npm run build:wasm` before publishing.

## Notes

This is a small local model, not an LLM. It proves the browser/WASM path first.
The same shell can later be upgraded to a heavier in-browser model using
Transformers.js, ONNX Runtime Web, or WebGPU-backed inference.
