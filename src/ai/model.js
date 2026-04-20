import fs from "fs";
import { DecisionTreeClassifier } from "ml-cart";
// baca file JSON
const raw = fs.readFileSync(new URL("./dataset.json", import.meta.url));
const dataset = JSON.parse(raw);

// ambil data
const features = dataset.map((d) => d.fitur);
const labels = dataset.map((d) => d.label);

const tree = new DecisionTreeClassifier({
  gainFunction: "gini",
  maxDepth: 5,
  minNumSamples: 3,
});

tree.train(features, labels);

export default tree;
