import {
  loadRealTransformer,
  MODEL_ID,
  runRealTransformer,
  TRANSFORMERS_VERSION,
} from "./inference/realTransformer.js";

const elements = {
  status: document.querySelector("#model-status"),
  runButton: document.querySelector("#run-button"),
  promptInput: document.querySelector("#prompt-input"),
  resultTitle: document.querySelector("#result-title"),
  resultDescription: document.querySelector("#result-description"),
  confidence: document.querySelector("#confidence-value"),
  scoreList: document.querySelector("#score-list"),
  modelSource: document.querySelector("#model-source"),
  runtime: document.querySelector("#runtime"),
  log: document.querySelector("#execution-log"),
};

let classifier;
let lastRun = 0;

function renderStars(stars) {
  elements.scoreList.replaceChildren(
    ...Array.from({ length: 5 }, (_, index) => {
      const star = document.createElement("span");
      star.className = index < stars ? "star is-active" : "star";
      star.textContent = "★";
      return star;
    }),
  );
}

async function renderRun() {
  if (!classifier) {
    return;
  }

  const text = elements.promptInput.value.trim();
  if (!text) {
    elements.log.textContent = "enter text before running inference";
    return;
  }

  elements.runButton.disabled = true;
  elements.status.textContent = "Running locally";
  elements.log.textContent = "tokenizing text and running ONNX/WASM inference";

  const output = await runRealTransformer(classifier, text);
  lastRun += 1;

  elements.resultTitle.textContent = `${output.result.stars} star sentiment`;
  elements.resultDescription.textContent = `Real pretrained transformer result: ${output.result.summary}. Raw label: ${output.result.label}.`;
  elements.confidence.textContent = `${output.result.confidence}%`;
  elements.runtime.textContent = `${output.runtimeMs.toFixed(3)} ms`;
  elements.log.textContent = `run #${lastRun}: ${JSON.stringify(output.raw)}`;
  elements.status.textContent = "Model ready";
  elements.runButton.disabled = false;
  renderStars(output.result.stars);
}

async function boot() {
  elements.runButton.disabled = true;
  elements.modelSource.textContent = MODEL_ID;
  elements.log.textContent = `loading Transformers.js ${TRANSFORMERS_VERSION}`;

  try {
    classifier = await loadRealTransformer({
      onProgress: (event) => {
        if (event?.status) {
          const file = event.file ? ` ${event.file}` : "";
          elements.log.textContent = `${event.status}${file}`;
        }
      },
    });
    elements.status.textContent = "Model ready";
    elements.log.textContent = "model loaded in browser; no backend call required";
    await renderRun();
  } catch (error) {
    elements.status.textContent = "Model failed";
    elements.log.textContent = error instanceof Error ? error.message : String(error);
    elements.runButton.disabled = false;
  } finally {
    elements.runButton.disabled = false;
  }
}

elements.runButton.addEventListener("click", renderRun);
boot();
