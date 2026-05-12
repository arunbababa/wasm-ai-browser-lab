import test from "node:test";
import assert from "node:assert/strict";

import {
  formatSentimentResult,
  MODEL_ID,
  parseStarLabel,
  TASK,
  TRANSFORMERS_VERSION,
} from "../src/inference/realTransformer.js";

test("real transformer metadata points at a browser-capable pretrained model", () => {
  assert.equal(TRANSFORMERS_VERSION, "3.8.1");
  assert.equal(TASK, "sentiment-analysis");
  assert.equal(MODEL_ID, "nlptown/bert-base-multilingual-uncased-sentiment");
});

test("parseStarLabel extracts the star count from model labels", () => {
  assert.equal(parseStarLabel("1 star"), 1);
  assert.equal(parseStarLabel("5 stars"), 5);
  assert.equal(parseStarLabel("LABEL_3"), 3);
});

test("formatSentimentResult turns model output into UI-ready confidence", () => {
  const result = formatSentimentResult([{ label: "5 stars", score: 0.913 }]);

  assert.equal(result.stars, 5);
  assert.equal(result.confidence, 91);
  assert.equal(result.summary, "positive");
});
