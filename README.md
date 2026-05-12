# Browser AI Lab

A static browser demo that runs a real pretrained Hugging Face transformer model
in the browser with Transformers.js. There is no backend API call for inference:
the browser downloads model assets and runs ONNX/WebAssembly locally.

## What It Shows

- Browser-only transformer inference with `@huggingface/transformers`
- Real pretrained model: `nlptown/bert-base-multilingual-uncased-sentiment`
- Japanese or English text input
- Confidence, star sentiment label, raw model output, runtime, and model id
- Static hosting friendly: GitHub Pages, Cloudflare Pages, or any file host

The repository still contains the tiny handwritten WASM module used as an early
diagnostic, but the app UI now runs the real transformer model.

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

Writes `public/tiny-infer.wasm` from the local bytecode builder. This is kept as
a diagnostic artifact, not the main AI path.

```bash
npm run build
```

Writes the diagnostic WASM file and copies deployable static assets into `dist/`.

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
demo itself. Inference model assets are fetched by the visitor's browser from
Hugging Face/CDN.

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

The current model is a real transformer classifier, not an LLM. A heavier next
step would be browser text generation with a small causal language model, or a
WebGPU-backed model when the target browser supports it.
