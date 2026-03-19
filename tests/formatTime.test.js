import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatTime } from "../js/formatTime.js";

describe("formatTime", () => {
  const ts = new Date("2026-03-18T14:23:07Z").getTime();

  it("full format: HH:MM:SS", () => {
    const result = formatTime(ts, "full");
    assert.match(result, /^\d{2}:\d{2}:\d{2}$/);
  });
  it("compact format: HH:MM", () => {
    const result = formatTime(ts, "compact");
    assert.match(result, /^\d{2}:\d{2}$/);
  });
  it("date format: YYYY-MM-DD", () => {
    const result = formatTime(ts, "date");
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });
  it("relative format: Xs/Xm/Xh/Xd ago", () => {
    const recent = Date.now() - 30000;
    const result = formatTime(recent, "relative");
    assert.match(result, /\d+s ago/);
  });
  it("duration format: Xm Xs", () => {
    const result = formatTime(90000, "duration");
    assert.strictEqual(result, "1m 30s");
  });
  it("duration hours: Xh Xm", () => {
    const result = formatTime(3661000, "duration");
    assert.strictEqual(result, "1h 1m");
  });
  it("defaults to full format", () => {
    const result = formatTime(ts);
    assert.match(result, /^\d{2}:\d{2}:\d{2}$/);
  });
});
