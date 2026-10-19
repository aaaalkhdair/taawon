import assert from "node:assert";
import test from "node:test";
import { demoInitialReport, demoPlan } from "../src/lib/ai/demo";

test("demoInitialReport produces structured clinical report", () => {
  const report = demoInitialReport("سارة", 5);

  assert.ok(report.summary.includes("سارة"), "Summary must mention child name");
  assert.ok(report.strengths.length >= 3, "Must have at least 3 strengths");
  assert.ok(report.challenges.length >= 3, "Must have at least 3 challenges");
  assert.ok(report.behaviors.length >= 2, "Must identify key behaviors");
  assert.ok(report.recommendations.length >= 3, "Must have actionable clinical recommendations");
});

test("demoPlan generates full 12-week rehabilitation plan with weekly phases", () => {
  const plan = demoPlan("سارة");

  assert.ok(plan.unifiedInsight.length > 50, "Plan must have unified clinical insight");
  assert.ok(plan.goals.length >= 3, "Plan must have multidisciplinary goals");
  assert.strictEqual(plan.phases.length, 12, "Must contain exactly 12 weekly rehabilitation phases");

  // Verify each week has a valid title, focus, and tasks
  for (let i = 0; i < 12; i++) {
    const phase = plan.phases[i];
    assert.strictEqual(phase.week, i + 1, `Week number must be ${i + 1}`);
    assert.ok(phase.title, `Week ${i + 1} must have phase title`);
    assert.ok(phase.focus, `Week ${i + 1} must have focus area`);
    assert.ok(phase.tasks.length > 0, `Week ${i + 1} must have at least one task`);

    // Verify task structure
    for (const task of phase.tasks) {
      assert.ok(task.domain, "Task must have clinical domain");
      assert.ok(task.title, "Task must have title");
      assert.ok(task.description, "Task must have clinical description");
      assert.ok(task.howTo, "Task must have parent-facing execution instructions");
    }
  }
});
