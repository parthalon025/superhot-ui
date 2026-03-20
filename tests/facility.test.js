/**
 * Facility state system tests.
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { setFacilityState, getFacilityState } from "../js/facility.js";

describe("facility state system", () => {
  let origDocument;

  beforeEach(() => {
    origDocument = global.document;
    global.document = {
      documentElement: {
        _attrs: {},
        setAttribute(name, value) {
          this._attrs[name] = value;
        },
        getAttribute(name) {
          return this._attrs[name];
        },
      },
    };
  });

  afterEach(() => {
    global.document = origDocument;
    // Reset to normal
    setFacilityState("normal");
  });

  it("defaults to normal state", () => {
    assert.equal(getFacilityState(), "normal");
  });

  it("sets state to alert", () => {
    setFacilityState("alert");
    assert.equal(getFacilityState(), "alert");
    assert.equal(global.document.documentElement._attrs["data-sh-facility"], "alert");
  });

  it("sets state to breach", () => {
    setFacilityState("breach");
    assert.equal(getFacilityState(), "breach");
    assert.equal(global.document.documentElement._attrs["data-sh-facility"], "breach");
  });

  it("sets state back to normal", () => {
    setFacilityState("breach");
    setFacilityState("normal");
    assert.equal(getFacilityState(), "normal");
    assert.equal(global.document.documentElement._attrs["data-sh-facility"], "normal");
  });

  it("ignores invalid state values", () => {
    setFacilityState("alert");
    setFacilityState("invalid");
    assert.equal(getFacilityState(), "alert");
  });

  it("ignores XSS attempt in state", () => {
    setFacilityState("<script>alert(1)</script>");
    assert.equal(getFacilityState(), "normal");
  });

  it("works when document is undefined (SSR)", () => {
    global.document = undefined;
    assert.doesNotThrow(() => setFacilityState("alert"));
    assert.equal(getFacilityState(), "alert");
  });
});
