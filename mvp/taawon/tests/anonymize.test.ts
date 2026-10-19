import assert from "node:assert";
import test from "node:test";
import { createAnonymizer } from "../src/lib/ai/anonymize";

test("createAnonymizer masks child and parent identities in Arabic", () => {
  const anonymizer = createAnonymizer([
    { value: "سارة طارق المعايطة", token: "[CHILD]" },
    { value: "طارق المعايطة", token: "[PARENT]" },
    { value: "د. بشير الخصاونة", token: "[SPECIALIST]" },
  ]);

  const raw = "قامت الطفلة سارة طارق المعايطة بالتواصل مع والدها طارق المعايطة بإشراف د. بشير الخصاونة.";
  const masked = anonymizer.mask(raw);

  assert.ok(!masked.includes("سارة طارق المعايطة"), "Full child name must not appear in masked text");
  assert.ok(!masked.includes("سارة"), "First name must not appear in masked text");
  assert.ok(!masked.includes("بشير الخصاونة"), "Specialist name must not appear in masked text");
  assert.ok(masked.includes("[CHILD]"), "Token [CHILD] must be present");
  assert.ok(masked.includes("[PARENT]"), "Token [PARENT] must be present");
  assert.ok(masked.includes("[SPECIALIST]"), "Token [SPECIALIST] must be present");
});

test("createAnonymizer masks phone numbers and emails", () => {
  const anonymizer = createAnonymizer([]);
  const text = "للتواصل عبر البريد parent@example.com أو الهاتف +962791234567";
  const masked = anonymizer.mask(text);

  assert.ok(!masked.includes("parent@example.com"), "Email must be masked");
  assert.ok(!masked.includes("+962791234567"), "Phone must be masked");
  assert.ok(masked.includes("[email]"), "[email] placeholder must be present");
  assert.ok(masked.includes("[phone]"), "[phone] placeholder must be present");
});

test("createAnonymizer unmasks tokens back to first names for natural reading", () => {
  const anonymizer = createAnonymizer([
    { value: "سارة المعايطة", token: "[CHILD]" },
  ]);

  const aiOutput = "تم إحراز تقدم ملحوظ لدى [CHILD] في مهارات النطق.";
  const unmasked = anonymizer.unmask(aiOutput);

  assert.ok(unmasked.includes("سارة"), "Token must unmask to readable first name");
  assert.ok(!unmasked.includes("[CHILD]"), "Token must be replaced");
});
