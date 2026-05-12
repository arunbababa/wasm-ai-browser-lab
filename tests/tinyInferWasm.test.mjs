import test from "node:test";
import assert from "node:assert/strict";

import { buildTinyInferWasm } from "../src/wasm/tinyInferBytes.js";

async function loadExports() {
  const wasmBytes = buildTinyInferWasm();
  const result = await WebAssembly.instantiate(wasmBytes);
  return result.instance.exports;
}

test("tiny inference wasm exposes the expected score functions", async () => {
  const exports = await loadExports();

  assert.equal(typeof exports.score_calm, "function");
  assert.equal(typeof exports.score_build, "function");
  assert.equal(typeof exports.score_explore, "function");
});

test("tiny inference wasm favors calm for low energy, high focus, low noise", async () => {
  const model = await loadExports();
  const calm = model.score_calm(4, 35, 2);
  const build = model.score_build(4, 35, 2);
  const explore = model.score_explore(4, 35, 2);

  assert.ok(calm > build);
  assert.ok(calm > explore);
});

test("tiny inference wasm favors build for high energy and high focus", async () => {
  const model = await loadExports();
  const calm = model.score_calm(32, 35, 5);
  const build = model.score_build(32, 35, 5);
  const explore = model.score_explore(32, 35, 5);

  assert.ok(build > calm);
  assert.ok(build > explore);
});

test("tiny inference wasm favors explore for noisy, low-focus inputs", async () => {
  const model = await loadExports();
  const calm = model.score_calm(14, 4, 38);
  const build = model.score_build(14, 4, 38);
  const explore = model.score_explore(14, 4, 38);

  assert.ok(explore > calm);
  assert.ok(explore > build);
});
