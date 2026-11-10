const { test } = require("node:test");
const assert = require("node:assert/strict");
const { estimateCooling } = require("../js/cooling-calculator.js");

const base = { length: 5, width: 4, height: 2.4, room: "bedroom", insulation: "average", sun: "typical", glazing: "average", people: 2 };

test("20 m² typical room: 2.0 kW load, 2.0 kW nominal suggestion", () => {
  const result = estimateCooling(base);
  assert.equal(result.area, 20);
  assert.equal(result.coolingKw, 2);
  assert.equal(result.suggestedKw, 2);
  assert.equal(result.needsSurvey, false);
});

test("sunny room and large glazing raise capacity", () => {
  const result = estimateCooling({ ...base, width: 5, sun: "sunny", glazing: "large" });
  assert.ok(result.coolingKw > 3.3);
  assert.equal(result.suggestedKw, 3.5);
  assert.equal(result.solarCaution, true);
});

test("extra occupants add 120 W each beyond two", () => {
  const result = estimateCooling({ ...base, people: 4 });
  assert.ok(Math.abs(result.coolingKw - 2.24) < 0.00001);
  assert.equal(result.suggestedKw, 2.5);
});

test("tall, large and conservatory rooms require assessment", () => {
  assert.equal(estimateCooling({ ...base, height: 3.6 }).needsSurvey, true);
  assert.equal(estimateCooling({ ...base, width: 11 }).needsSurvey, true);
  assert.equal(estimateCooling({ ...base, room: "conservatory" }).needsSurvey, true);
});

test("invalid dimensions and choices are rejected", () => {
  assert.throws(() => estimateCooling({ ...base, length: 0 }), RangeError);
  assert.throws(() => estimateCooling({ ...base, room: "server-room" }), RangeError);
});
