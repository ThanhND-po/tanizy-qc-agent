#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixtureRoot = join(repoRoot, "tests", "atomic-test-objectives");
const sources = readFileSync(join(fixtureRoot, "approved-sources.md"), "utf8");
const viewpoints = readFileSync(join(fixtureRoot, "locked-viewpoints.md"), "utf8");
const existingEvidence = readFileSync(
  join(fixtureRoot, "existing-cases-and-evidence.md"),
  "utf8",
);
const request = readFileSync(join(fixtureRoot, "evaluation-request.md"), "utf8");
const rubric = readFileSync(join(fixtureRoot, "rubric.md"), "utf8");
const scenarios = ["A", "B1", "B2", "C", "D", "E", "F", "G", "H", "I"];

for (const scenario of scenarios) {
  assert.match(sources, new RegExp(`^## Scenario ${scenario}:`, "m"));
  assert.match(rubric, new RegExp(`^## Scenario ${scenario}:`, "m"));
}

assert.ok(request.includes("scenarios A, B1, B2, C, D, E, F, G, H, and I"));

for (const locator of [
  "tests/atomic-test-objectives/approved-sources.md",
  "tests/atomic-test-objectives/locked-viewpoints.md",
  "tests/atomic-test-objectives/existing-cases-and-evidence.md",
]) {
  assert.ok(request.includes(locator), `Evaluation request is missing exact locator ${locator}`);
}

for (const vpId of [
  "VP-ATO-002",
  "VP-ATO-003",
  "VP-ATO-004",
  "VP-ATO-005",
  "VP-ATO-006",
  "VP-ATO-008",
  "VP-ATO-009",
  "VP-ATO-010",
  "VP-ATO-011",
  "VP-ATO-013",
]) {
  assert.ok(viewpoints.includes(vpId), `Locked fixture is missing ${vpId}`);
  assert.ok(rubric.includes(vpId), `Rubric is missing ${vpId}`);
}

assert.match(viewpoints, /\| fixture-v1 \| LOCKED \| DIRECT_SOURCE_CHECK \| READY \|/);
assert.match(viewpoints, /\| Optional Project Extension \| `qc\/config\/viewpoint-discovery-extension\.md` \| ABSENT \|/);
assert.match(existingEvidence, /The current coverage total reports `2\/2` branches designed\./);
assert.match(existingEvidence, /\| 3 \| Open Cart Details \|.*\| NOT_EXECUTED \|/);
assert.doesNotMatch(request, /expected behavior|rubric|must identify|must split/i);

console.log(`Atomic objective fixtures passed: ${scenarios.length} neutral scenarios and review rubrics.`);
