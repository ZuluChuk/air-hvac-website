const { test } = require("node:test");
const assert = require("node:assert/strict");
const { estimateCooling } = require("../js/cooling-calculator.js");

const base = { length: 5, width: 4, height: 2.4, room: "bedroom", insulation: "average", sun: "typical", glazing: "average", people: 2 };

test("typical 20 m² room shows cooling and separate heating loads", () => {
  const result = estimateCooling(base);
  assert.equal(result.area, 20);
  assert.equal(result.coolingKw, 2);
  assert.ok(Math.abs(result.heatingKw - 1.4) < 0.00001);
  assert.equal(result.suggestedKw, 2);
  assert.equal(result.needsSurvey, false);
});

test("sunny room with large glazing raises summer cooling load", () => {
  const result = estimateCooling({ ...base, width: 5, sun: "sunny", glazing: "large" });
  assert.ok(result.coolingKw > 3.3);
  assert.equal(result.suggestedKw, 3.5);
  assert.equal(result.solarCaution, true);
});

test("occupancy affects cooling but not heating-loss proxy", () => {
  const result = estimateCooling({ ...base, people: 4 });
  assert.ok(Math.abs(result.coolingKw - 2.24) < 0.00001);
  assert.equal(result.heatingKw, 1.4);
  assert.equal(result.suggestedKw, 2.5);
});

test("heating load responds to insulation and glazing, not summer sun", () => {
  const poor = estimateCooling({ ...base, insulation: "poor", glazing: "large", sun: "shaded" });
  const sunny = estimateCooling({ ...base, insulation: "poor", glazing: "large", sun: "sunny" });
  assert.ok(poor.heatingKw > base.length * base.width * 0.07);
  assert.ok(poor.heatingKw > poor.coolingKw);
  assert.equal(poor.suggestedKw, 3.5);
  assert.equal(poor.heatingKw, sunny.heatingKw);
  assert.ok(poor.heatingBtuPerHour > 0);
});

test("tall, large, conservatory, and over-capacity rooms require survey", () => {
  assert.equal(estimateCooling({ ...base, height: 3.6 }).needsSurvey, true);
  assert.equal(estimateCooling({ ...base, width: 11 }).needsSurvey, true);
  assert.equal(estimateCooling({ ...base, room: "conservatory" }).needsSurvey, true);
  assert.equal(estimateCooling({ ...base, width: 10, insulation: "poor", glazing: "large" }).needsSurvey, true);
});

test("invalid dimensions and choices are rejected", () => {
  assert.throws(() => estimateCooling({ ...base, length: 0 }), RangeError);
  assert.throws(() => estimateCooling({ ...base, length: 31 }), RangeError);
  assert.throws(() => estimateCooling({ ...base, room: "server-room" }), RangeError);
  assert.throws(() => estimateCooling({ ...base, people: 1.5 }), RangeError);
});
