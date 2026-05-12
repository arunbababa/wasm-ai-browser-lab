import { loadTinyModel, runTinyModel } from "./inference/runTinyModel.js";

const controls = {
  energy: document.querySelector("#energy"),
  focus: document.querySelector("#focus"),
  noise: document.querySelector("#noise"),
};

const values = {
  energy: document.querySelector("#energy-value"),
  focus: document.querySelector("#focus-value"),
  noise: document.querySelector("#noise-value"),
};

const elements = {
  status: document.querySelector("#model-status"),
  runButton: document.querySelector("#run-button"),
  resultTitle: document.querySelector("#result-title"),
  resultDescription: document.querySelector("#result-description"),
  confidence: document.querySelector("#confidence-value"),
  scoreList: document.querySelector("#score-list"),
  wasmSource: document.querySelector("#wasm-source"),
  runtime: document.querySelector("#runtime"),
  log: document.querySelector("#execution-log"),
};

let model;
let lastRun = 0;

function readInputs() {
  return {
    energy: controls.energy.value,
    focus: controls.focus.value,
    noise: controls.noise.value,
  };
}

function syncOutputValues() {
  for (const key of Object.keys(controls)) {
    values[key].value = controls[key].value;
    values[key].textContent = controls[key].value;
  }
}

function renderScores(ranking) {
  elements.scoreList.replaceChildren(
    ...ranking.map((item) => {
      const row = document.createElement("article");
      row.className = "score-row";
      row.innerHTML = `
        <div class="score-meta">
          <strong>${item.title}</strong>
          <span>${item.score} raw score</span>
        </div>
        <div class="score-track" aria-hidden="true">
          <span style="width: ${item.percent}%"></span>
        </div>
        <b>${item.percent}%</b>
      `;
      return row;
    }),
  );
}

function renderRun() {
  if (!model) {
    return;
  }

  syncOutputValues();
  const output = runTinyModel(model, readInputs());
  lastRun += 1;

  elements.resultTitle.textContent = output.result.title;
  elements.resultDescription.textContent = output.result.description;
  elements.confidence.textContent = `${output.result.confidence}%`;
  elements.runtime.textContent = `${output.runtimeMs.toFixed(3)} ms`;
  elements.log.textContent = `run #${lastRun}: scores ${JSON.stringify(output.scores)}`;
  renderScores(output.result.ranking);
}

async function boot() {
  syncOutputValues();
  elements.runButton.disabled = true;

  try {
    const loaded = await loadTinyModel();
    model = loaded.instance.exports;
    elements.status.textContent = "WASM model ready";
    elements.wasmSource.textContent = loaded.source;
    elements.log.textContent = loaded.warning
      ? `loaded fallback after: ${loaded.warning}`
      : "loaded ./public/tiny-infer.wasm";
    renderRun();
  } catch (error) {
    elements.status.textContent = "Model failed";
    elements.log.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    elements.runButton.disabled = false;
  }
}

for (const control of Object.values(controls)) {
  control.addEventListener("input", renderRun);
}

elements.runButton.addEventListener("click", renderRun);
boot();
