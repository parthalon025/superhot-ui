/**
 * Narrator corpus completeness test.
 * Asserts all 5 personalities × 12 categories exist and are non-empty arrays.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { corpus } from "../js/narrator-corpus.js";

const PERSONALITIES = ["glados", "cave", "wheatley", "turret", "superhot"];
const CATEGORIES = [
  "toast",
  "error",
  "loading",
  "status",
  "empty",
  "greeting",
  "farewell",
  "countdown",
  "warning",
  "destructive",
  "success",
  "search",
];

describe("narrator corpus completeness", () => {
  for (const personality of PERSONALITIES) {
    describe(personality, () => {
      it("exists in corpus", () => {
        assert.ok(corpus[personality], `corpus.${personality} should exist`);
      });

      for (const category of CATEGORIES) {
        it(`has non-empty ${category} array`, () => {
          const phrases = corpus[personality][category];
          assert.ok(Array.isArray(phrases), `${personality}.${category} should be an array`);
          assert.ok(phrases.length > 0, `${personality}.${category} should be non-empty`);
        });
      }
    });
  }

  it("all phrases are strings or functions", () => {
    for (const personality of PERSONALITIES) {
      for (const category of CATEGORIES) {
        const phrases = corpus[personality][category];
        for (let i = 0; i < phrases.length; i++) {
          const phrase = phrases[i];
          const type = typeof phrase;
          assert.ok(
            type === "string" || type === "function",
            `${personality}.${category}[${i}] should be string or function, got ${type}`,
          );
        }
      }
    }
  });
});
