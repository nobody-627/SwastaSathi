import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(
  __dirname,
  "..",
  "data",
  "acute_inflammations",
  "diagnosis.data",
);

const FEATURE_KEYS = [
  "nausea",
  "lumbarPain",
  "urinePushing",
  "micturitionPains",
  "burningUrethra",
];

let cachedModel = null;

function parseYesNo(value) {
  return String(value).trim().toLowerCase() === "yes" ? 1 : 0;
}

function decodeDataset(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString("utf16le");
  }
  return buffer.toString("utf8");
}

function loadDataset() {
  const raw = fs.readFileSync(DATA_PATH);
  const text = decodeDataset(raw);
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = [];
  for (const line of lines) {
    const parts = line.split(/\t+/);
    const tokens = parts.length > 1 ? parts : line.split(/\s+/);
    if (tokens.length < 8) continue;

    const temperature = Number(tokens[0].replace(",", "."));
    const features = {
      nausea: parseYesNo(tokens[1]),
      lumbarPain: parseYesNo(tokens[2]),
      urinePushing: parseYesNo(tokens[3]),
      micturitionPains: parseYesNo(tokens[4]),
      burningUrethra: parseYesNo(tokens[5]),
    };
    const bladderInflammation = parseYesNo(tokens[6]);
    const nephritis = parseYesNo(tokens[7]);

    if (Number.isNaN(temperature)) continue;
    rows.push({ temperature, features, bladderInflammation, nephritis });
  }

  if (rows.length === 0) {
    throw new Error("No rows parsed from Acute Inflammations dataset");
  }
  return rows;
}

function mean(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function variance(values, mu) {
  if (values.length === 0) return 1e-6;
  const varSum = values.reduce((sum, v) => sum + (v - mu) ** 2, 0);
  return Math.max(varSum / values.length, 1e-6);
}

function trainBinaryNaiveBayes(rows, targetKey) {
  const alpha = 1;
  const totals = { 0: 0, 1: 0 };
  const featureCounts = {
    0: Object.fromEntries(FEATURE_KEYS.map((k) => [k, 0])),
    1: Object.fromEntries(FEATURE_KEYS.map((k) => [k, 0])),
  };
  const tempValues = { 0: [], 1: [] };

  for (const row of rows) {
    const label = row[targetKey];
    totals[label] += 1;
    tempValues[label].push(row.temperature);
    for (const key of FEATURE_KEYS) {
      if (row.features[key] === 1) featureCounts[label][key] += 1;
    }
  }

  const totalRows = totals[0] + totals[1];
  const priors = {
    0: totals[0] / totalRows,
    1: totals[1] / totalRows,
  };

  const bernoulli = { 0: {}, 1: {} };
  for (const label of [0, 1]) {
    const denom = totals[label] + 2 * alpha;
    for (const key of FEATURE_KEYS) {
      bernoulli[label][key] = (featureCounts[label][key] + alpha) / denom;
    }
  }

  const gauss = {};
  for (const label of [0, 1]) {
    const mu = mean(tempValues[label]);
    const varValue = variance(tempValues[label], mu);
    gauss[label] = { mean: mu, variance: varValue };
  }

  return { priors, bernoulli, gauss };
}

function gaussianLogPdf(x, mu, variance) {
  const logCoef = -0.5 * Math.log(2 * Math.PI * variance);
  const logExp = -((x - mu) ** 2) / (2 * variance);
  return logCoef + logExp;
}

function predictProbability(model, features) {
  const scores = {};
  for (const label of [0, 1]) {
    let logProb = Math.log(model.priors[label] || 1e-9);

    for (const key of FEATURE_KEYS) {
      const p = model.bernoulli[label][key];
      const x = features[key] ? 1 : 0;
      logProb += x ? Math.log(p) : Math.log(1 - p);
    }

    logProb += gaussianLogPdf(
      features.temperature,
      model.gauss[label].mean,
      model.gauss[label].variance,
    );

    scores[label] = logProb;
  }

  const maxLog = Math.max(scores[0], scores[1]);
  const p0 = Math.exp(scores[0] - maxLog);
  const p1 = Math.exp(scores[1] - maxLog);
  return p1 / (p0 + p1);
}

export function loadAcuteInflammationsModel() {
  if (cachedModel) return cachedModel;

  const rows = loadDataset();
  cachedModel = {
    bladder: trainBinaryNaiveBayes(rows, "bladderInflammation"),
    nephritis: trainBinaryNaiveBayes(rows, "nephritis"),
    totalRows: rows.length,
  };
  return cachedModel;
}

export function predictAcuteInflammations(input) {
  const model = loadAcuteInflammationsModel();
  const features = {
    temperature: Number(input.temperature),
    nausea: Boolean(input.nausea),
    lumbarPain: Boolean(input.lumbarPain),
    urinePushing: Boolean(input.urinePushing),
    micturitionPains: Boolean(input.micturitionPains),
    burningUrethra: Boolean(input.burningUrethra),
  };

  if (Number.isNaN(features.temperature)) {
    throw new Error("Temperature is required for prediction");
  }

  return {
    bladderInflammation: predictProbability(model.bladder, features),
    nephritis: predictProbability(model.nephritis, features),
    totalRows: model.totalRows,
  };
}
