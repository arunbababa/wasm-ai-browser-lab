import test from "node:test";
import assert from "node:assert/strict";

import { classifyScores, normalizeInputs } from "../src/inference/classify.js";

test("normalizeInputs clamps numeric UI values into the model range", () => {
  assert.deepEqual(
    normalizeInputs({ energy: -12, focus: 99, noise: "17" }),
    { energy: 0, focus: 40, noise: 17 },
  );
});

test("classifyScores ranks the strongest score first with normalized confidence", () => {
  const result = classifyScores({ calm: 10, build: 30, explore: 20 });

  assert.equal(result.label, "build");
  assert.equal(result.confidence, 50);
  assert.deepEqual(
    result.ranking.map((item) => item.label),
    ["build", "explore", "calm"],
  );
});

test("classifyScores handles negative model scores without negative percentages", () => {
  const result = classifyScores({ calm: -20, build: -5, explore: -15 });

  assert.equal(result.label, "build");
  assert.equal(result.confidence, 70);
  assert.deepEqual(
    result.ranking.map((item) => item.percent),
    [70, 26, 4],
  );
});
