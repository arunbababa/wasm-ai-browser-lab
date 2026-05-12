export const TRANSFORMERS_VERSION = "3.8.1";
export const MODEL_ID = "nlptown/bert-base-multilingual-uncased-sentiment";
export const TASK = "sentiment-analysis";

let classifierPromise;

export function parseStarLabel(label) {
  const match = String(label).match(/([1-5])/);
  return match ? Number(match[1]) : 0;
}

export function formatSentimentResult(output) {
  const first = Array.isArray(output) ? output[0] : output;
  const label = first?.label ?? "unknown";
  const score = Number(first?.score ?? 0);
  const stars = parseStarLabel(label);

  return {
    label,
    stars,
    confidence: Math.round(score * 100),
    score,
    summary: stars >= 4
      ? "positive"
      : stars <= 2
        ? "negative"
        : "mixed",
  };
}

export async function loadRealTransformer({ onProgress } = {}) {
  if (!classifierPromise) {
    classifierPromise = import(
      `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}`
    ).then(async ({ pipeline, env }) => {
      env.allowLocalModels = false;
      return pipeline(TASK, MODEL_ID, {
        dtype: "q4",
        progress_callback: (event) => {
          if (typeof onProgress === "function") {
            onProgress(event);
          }
        },
      });
    });
  }

  return classifierPromise;
}

export async function runRealTransformer(classifier, text) {
  const started = performance.now();
  const output = await classifier(text);

  return {
    raw: output,
    result: formatSentimentResult(output),
    runtimeMs: performance.now() - started,
  };
}
