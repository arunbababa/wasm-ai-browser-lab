const LABELS = ["calm", "build", "explore"];

export const labelDetails = {
  calm: {
    title: "Calm Router",
    description: "入力は安定寄り。ノイズを抑えて整理するAIっぽい判断です。",
  },
  build: {
    title: "Build Mode",
    description: "集中とエネルギーが高め。実装を進める判断に寄っています。",
  },
  explore: {
    title: "Explore Mode",
    description: "ノイズや揺らぎが強め。探索や発散に寄せる判断です。",
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toModelValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return clamp(Math.round(number), 0, 40);
}

function percentagesFromWeights(weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => Math.round((weight / total) * 100));
}

export function normalizeInputs(inputs) {
  return {
    energy: toModelValue(inputs.energy),
    focus: toModelValue(inputs.focus),
    noise: toModelValue(inputs.noise),
  };
}

export function classifyScores(scores) {
  const entries = LABELS
    .map((label) => ({
      label,
      score: Number(scores[label] ?? 0),
    }))
    .sort((left, right) => right.score - left.score);

  const minScore = Math.min(...entries.map((entry) => entry.score));
  const hasPositiveScore = entries.some((entry) => entry.score > 0);
  const weights = entries.map((entry) => (
    hasPositiveScore ? Math.max(0, entry.score) : entry.score - minScore + 1
  ));
  const percentages = percentagesFromWeights(weights);
  const ranking = entries.map((entry, index) => ({
    ...entry,
    percent: percentages[index],
    ...labelDetails[entry.label],
  }));

  return {
    label: ranking[0].label,
    title: ranking[0].title,
    confidence: ranking[0].percent,
    description: ranking[0].description,
    ranking,
  };
}
