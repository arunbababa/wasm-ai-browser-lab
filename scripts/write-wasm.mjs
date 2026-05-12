import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { buildTinyInferWasm } from "../src/wasm/tinyInferBytes.js";

const outputPath = resolve("public/tiny-infer.wasm");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, buildTinyInferWasm());
console.log(`Wrote ${outputPath}`);
