/* eslint-disable no-console */
/**
 * Demo seed for the investor presentation.
 * Run: npm run db:seed   (wipes and recreates all data)
 */
import bcrypt from "bcryptjs";
import { db, schema } from "../src/db";
import { demoInitialReport, demoPlan } from "../src/lib/ai/demo";
import type { Domain } from "../src/db/schema";

const PASSWORD = "Taawon@2026";
const SAMPLE_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

// deterministic PRNG so the demo looks the same every time
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const dk = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};

const QUESTIONS: { section: string; ar: string; en: string; type: "text" | "choice" | "scale"; options?: { ar: string; en: string }[] }[] = [
  { section: "general", ar: "ما أبرز ما يقلقك بشأن طفلك حالياً؟", en: "What concerns you most about your child right now?", type: "text" },
  { section: "general", ar: "هل سبق أن حصل الطفل على تشخيص أو تقييم؟ اذكره إن وجد.", en: "Has your child received any diagnosis or assessment before? Please specify.", type: "text" },
  { section: "general", ar: "كيف كانت فترة الحمل والولادة؟", en: "How were the pregnancy and birth?", type: "choice", options: [{ ar: "طبيعية", en: "Normal" }, { ar: "بها مضاعفات بسيطة", en: "Minor complications" }, { ar: "بها مضاعفات كبيرة", en: "Major complications" }] },
  { section: "communication", ar: "كيف يعبّر طفلك عن احتياجاته؟", en: "How does your child express needs?", type: "choice", options: [{ ar: "بالبكاء أو الإشارة", en: "Crying or pointing" }, { ar: "بكلمات مفردة", en: "Single words" }, { ar: "بجمل قصيرة", en: "Short sentences" }, { ar: "بجمل كاملة", en: "Full sentences" }] },
  { section: "communication", ar: "هل يفهم طفلك التعليمات البسيطة (مثل: أحضر الكرة)؟", en: "Does your child understand simple instructions (e.g. bring the ball)?", type: "scale" },
  { section: "communication", ar: "هل يحافظ على التواصل البصري أثناء الحديث معه؟", en: "Does your child keep eye contact when spoken to?", type: "scale" },
  { section: "behavior", ar: "صف السلوكيات التي تزعجك أو تقلقك (نوبات غضب، حركات متكررة...)", en: "Describe behaviors that worry you (tantrums, repetitive movements...)", type: "text" },
  { section: "behavior", ar: "كيف يتقبّل طفلك تغيير الروتين أو الانتقال بين الأنشطة؟", en: "How does your child handle changes in routine or transitions?", type: "scale" },
  { section: "behavior", ar: "كم دقيقة يستطيع التركيز في نشاط يحبه؟", en: "How many minutes can your child focus on a favorite activity?", type: "choice", options: [{ ar: "أقل من 3 دقائق", en: "Less than 3 min" }, { ar: "3–10 دقائق", en: "3–10 min" }, { ar: "أكثر من 10 دقائق", en: "More than 10 min" }] },
  { section: "daily_living", ar: "إلى أي مدى يعتمد طفلك على نفسه في الأكل واللبس؟", en: "How independent is your child in eating and dressing?", type: "scale" },
  { section: "daily_living", ar: "هل يستخدم الحمّام باستقلالية؟", en: "Does your child use the toilet independently?", type: "choice", options: [{ ar: "نعم", en: "Yes" }, { ar: "بمساعدة", en: "With help" }, { ar: "لا", en: "No" }] },
  { section: "daily_living", ar: "كيف هو نوم الطفل؟", en: "How is your child's sleep?", type: "choice", options: [{ ar: "منتظم", en: "Regular" }, { ar: "متقطع أحياناً", en: "Sometimes interrupted" }, { ar: "صعب جداً", en: "Very difficult" }] },
  { section: "academic", ar: "هل يتعرّف على الألوان أو الأشكال أو الأرقام؟", en: "Does your child recognize colors, shapes or numbers?", type: "scale" },
  { section: "academic", ar: "ما الأنشطة والألعاب المفضلة لدى طفلك؟", en: "What are your child's favorite activities and toys?", type: "text" },
  { section: "academic", ar: "ما الذي تتمنى أن يحققه طفلك خلال الأشهر الثلاثة القادمة؟", en: "What do you hope your child achieves in the next 3 months?", type: "text" },
];

const CLINICAL: Record<string, (name: string) => string> = {
  speech: (n) =>
    `أولاً: الملاحظات السريرية\nتم تقييم ${n} باستخدام الملاحظة المنظمة واللعب الموجّه. اللغة الاستقبالية أفضل نسبياً من التعبيرية؛ يفهم الأوامر البسيطة المكوّنة من خطوة واحدة، ويستخدم 15–20 كلمة مفردة بشكل وظيفي.\n\nثانياً: نقاط القوة\n- تقليد جيد للأصوات والحركات.\n- اهتمام واضح بالصور والكتب.\n\nثالثاً: الاحتياجات\n- زيادة الحصيلة اللغوية التعبيرية.\n- الانتقال من الكلمة المفردة إلى جملة من كلمتين.\n\nرابعاً: التوصيات\n- جلستا تخاطب أسبوعياً، مع أنشطة منزلية لتسمية الصور والطلب اللفظي.`,
  behavior: (n) =>
    `أولاً: الملاحظات السريرية\nأظهر ${n} نوبات انفعالية قصيرة (2–4 دقائق) عند إنهاء نشاط مفضّل أو تغيير الروتين. الوظيفة الغالبة للسلوك: الهروب من المهمة والحصول على المرغوب.\n\nثانياً: نقاط القوة\n- استجابة سريعة للتعزيز الرمزي والمدح.\n\nثالثاً: الاحتياجات\n- تحسين تحمّل الانتظار وتقبّل الانتقالات.\n\nرابعاً: التوصيات\n- استخدام الجداول البصرية والمؤقّت المرئي، وتعزيز السلوك البديل بشكل فوري.`,
  special_ed: (n) =>
    `أولاً: الملاحظات السريرية\nيستطيع ${n} مطابقة الألوان الأساسية ويحتاج دعماً في التصنيف حسب الشكل. مدة الانتباه في نشاط موجّه حوالي 4 دقائق.\n\nثانياً: نقاط القوة\n- ذاكرة بصرية جيدة.\n\nثالثاً: الاحتياجات\n- زيادة مدة الانتباه المشترك، ومهارات الاعتماد على النفس (اللبس وغسل اليدين).\n\nرابعاً: التوصيات\n- أنشطة قصيرة متدرجة مع تعزيز، وتدريب يومي على المهارات الحياتية بالتسلسل العكسي.`,
};

async function wipe() {
  for (const t of [
    schema.chatMessages,
    schema.notifications,
    schema.submissions,
    schema.planTasks,
    schema.sessions,
    schema.plans,
    schema.clinicalReports,
    schema.initialReports,
    schema.questionnaireResponses,
    schema.assignments,
    schema.children,
    schema.questions,
    schema.users,
  ]) {
    await db.delete(t);
  }
}

async function main() {
  console.log("Seeding Taawon demo data...");
  await wipe();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const [admin, speech, behavior, specialEd, khaled, mona, abdullah] = await db
    .insert(schema.users)
    .values([
      { name: "د. بشير الخصاونة", email: "admin@taawon.app", role: "admin", passwordHash, phone: "0795551001" },
      { name: "أ. دينا حداد", email: "speech@taawon.app", role: "specialist", specialty: "speech", passwordHash, phone: "0795551002" },
      { name: "أ. ليث الرواشدة", email: "behavior@taawon.app", role: "specialist", specialty: "behavior", passwordHash, phone: "0795551003" },
      { name: "أ. هبة بني هاني", email: "specialed@taawon.app", role: "specialist", specialty: "special_ed", passwordHash, phone: "0795551004" },
      { name: "طارق المعايطة", email: "parent@taawon.app", role: "parent", passwordHash, phone: "0788882001" },
      { name: "منى عبيدات", email: "mona@taawon.app", role: "parent", passwordHash, phone: "0788882002" },
      { name: "عبدالله الحنيطي", email: "abdullah@taawon.app", role: "parent", passwordHash, phone: "0777773001" },
    ])
    .returning();
  const specialists = [speech, behavior, specialEd];

  const qRows = await db
    .insert(schema.questions)
    .values(
      QUESTIONS.map((q, i) => ({
        section: q.section,
        textAr: q.ar,
        textEn: q.en,
        type: q.type,
        options: q.options ? JSON.stringify(q.options) : null,
        order: i,
      }))
    )
    .returning();

  const [sara, yousef, omar, leen, rayan] = await db
    .insert(schema.children)
    .values([
      { name: "سارة طارق المعايطة", birthDate: "2020-03-14", gender: "female", parentId: khaled.id, diagnosis: "تأخر لغوي مع اضطراب في الانتباه", status: "active" },
      { name: "يوسف طارق المعايطة", birthDate: "2021-07-02", gender: "male", parentId: khaled.id, status: "new" },
      { name: "عمر أحمد عبيدات", birthDate: "2019-11-20", gender: "male", parentId: mona.id, diagnosis: "اضطراب طيف التوحد (درجة بسيطة)", status: "plan_review" },
      { name: "لين عبدالله الحنيطي", birthDate: "2021-01-09", gender: "female", parentId: abdullah.id, status: "new" },
      { name: "سند عبدالله الحنيطي", birthDate: "2018-05-30", gender: "male", parentId: abdullah.id, diagnosis: "صعوبات تعلّم وتأخر نمائي", status: "active" },
    ])
    .returning();

  // assignments: everyone gets all three specialists except Yousef (speech + behavior)
  const assign = (childId: string, ss: typeof specialists) => ss.map((s) => ({ childId, specialistId: s.id }));
  await db.insert(schema.assignments).values([
    ...assign(sara.id, specialists),
    ...assign(yousef.id, [speech, behavior]),
    ...assign(omar.id, specialists),
    ...assign(leen.id, [speech, specialEd]),
    ...assign(rayan.id, specialists),
  ]);

  // questionnaire + initial reports for all but Leen and Yousef
  const sampleAnswers = (name: string) =>
    Object.fromEntries(
      qRows.map((q) => {
        if (q.type === "scale") return [q.id, String(2 + Math.floor(rand() * 2))];
        if (q.type === "choice") {
          const opts = JSON.parse(q.options!) as { ar: string }[];
          return [q.id, opts[Math.min(1, opts.length - 1)].ar];
        }
        const text: Record<string, string> = {
          general: `${name} لا يتكلم كثيراً مقارنة بأقرانه ويغضب بسرعة عندما لا نفهمه.`,
          behavior: "يبكي ويرمي الأشياء عند إطفاء التلفاز أو الخروج من المنزل، ويرفرف بيديه عند الحماس.",
          academic: "يحب الألغاز والمكعبات وأغاني الأطفال، ونتمنى أن يطلب احتياجاته بالكلام.",
        };
        return [q.id, text[q.section] ?? "لا يوجد"];
      })
    );

  const ages: Record<string, number> = { [sara.id]: 6, [omar.id]: 6, [rayan.id]: 8 };
  for (const c of [sara, omar, rayan]) {
    const first = c.name.split(" ")[0];
    await db.insert(schema.questionnaireResponses).values({ childId: c.id, answers: JSON.stringify(sampleAnswers(first)), createdAt: daysAgo(60).toISOString() });
    await db.insert(schema.initialReports).values({ childId: c.id, content: demoInitialReport(first, ages[c.id]), source: "demo", createdAt: daysAgo(59).toISOString() });
  }

  // clinical reports
  const report = (childId: string, s: (typeof specialists)[number], name: string, ago: number) => ({
    childId,
    specialistId: s.id,
    content: CLINICAL[s.specialty!](name),
    createdAt: daysAgo(ago).toISOString(),
  });
  await db.insert(schema.clinicalReports).values([
    ...specialists.map((s) => report(sara.id, s, "سارة", 52)),
    ...specialists.map((s) => report(rayan.id, s, "سند", 70)),
    ...specialists.map((s) => report(omar.id, s, "عمر", 2)),
  ]);

  // pending plan for Omar (admin approves live in the demo)
  await db.insert(schema.plans).values({ childId: omar.id, content: demoPlan("عمر"), source: "demo", status: "pending", version: 1, createdAt: daysAgo(1).toISOString() });

  // active plans with history
  async function activePlan(childId: string, name: string, weeksIn: number, quality: number) {
    const start = daysAgo(weeksIn * 7 - 3);
    const [plan] = await db
      .insert(schema.plans)
      .values({ childId, content: demoPlan(name), source: "demo", status: "approved", version: 1, startDate: dk(start), approvedAt: start.toISOString(), createdAt: daysAgo(weeksIn * 7).toISOString() })
      .returning();
    const tasks = await db
      .insert(schema.planTasks)
      .values(plan.content.phases.flatMap((ph) => ph.tasks.map((t) => ({ planId: plan.id, childId, week: ph.week, title: t.title, description: t.description, howTo: t.howTo, domain: t.domain as Domain }))))
      .returning();

    const subs: (typeof schema.submissions.$inferInsert)[] = [];
    const totalDays = weeksIn * 7 - 3;
    for (let i = totalDays; i >= 1; i--) {
      const day = daysAgo(i);
      const week = Math.floor((totalDays - i) / 7) + 1;
      const progressFactor = (totalDays - i) / totalDays; // 0 → 1 over time
      for (const t of tasks.filter((x) => x.week === week)) {
        if (rand() > 0.62 + quality * 0.25) continue; // skipped
        const hasVideo = rand() < 0.45;
        const recent = i <= 3;
        const base = 2 + progressFactor * 2.2 + quality * 0.6 + (rand() - 0.5);
        const rating = Math.max(1, Math.min(5, Math.round(base)));
        subs.push({
          taskId: t.id,
          childId,
          date: dk(day),
          videoUrl: hasVideo ? SAMPLE_VIDEO : null,
          note: hasVideo ? "طبّقنا المهمة بعد العصر، وكان متعاوناً أغلب الوقت." : null,
          rating: hasVideo && recent ? null : rating,
          feedback: hasVideo && !recent ? "أداء جيد 👏 حاولوا تقليل المساعدة تدريجياً." : null,
          evaluatedBy: hasVideo && recent ? null : specialists[Math.floor(rand() * 3)].id,
          evaluatedAt: hasVideo && recent ? null : day.toISOString(),
          createdAt: day.toISOString(),
        });
      }
    }
    for (let i = 0; i < subs.length; i += 100) await db.insert(schema.submissions).values(subs.slice(i, i + 100));
    return plan;
  }
  await activePlan(sara.id, "سارة", 6, 0.6);
  await activePlan(rayan.id, "سند", 9, 0.35);

  // sessions: past + upcoming
  const at = (dayOffset: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  await db.insert(schema.sessions).values([
    { childId: sara.id, specialistId: speech.id, startsAt: at(-7, 10), status: "done", notes: "تحسّن ملحوظ في الطلب اللفظي." },
    { childId: sara.id, specialistId: behavior.id, startsAt: at(-3, 11), status: "done" },
    { childId: sara.id, specialistId: speech.id, startsAt: at(1, 10) },
    { childId: sara.id, specialistId: specialEd.id, startsAt: at(2, 12) },
    { childId: rayan.id, specialistId: specialEd.id, startsAt: at(0, 13) },
    { childId: rayan.id, specialistId: behavior.id, startsAt: at(3, 9), type: "online" },
    { childId: omar.id, specialistId: speech.id, startsAt: at(4, 11) },
    { childId: yousef.id, specialistId: speech.id, startsAt: at(1, 9), notes: "جلسة تقييم تخاطب" },
  ]);

  // notifications
  const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
  await db.insert(schema.notifications).values([
    { userId: admin.id, titleAr: "خطة علاجية بانتظار الاعتماد: عمر أحمد عبيدات", titleEn: "Treatment plan awaiting approval: Omar", bodyAr: "النسخة 1 جاهزة للمراجعة.", bodyEn: "Version 1 is ready for review.", link: "/admin/plans", createdAt: ago(20) },
    { userId: admin.id, titleAr: "طفل جديد مسجل بانتظار الاستبيان: يوسف طارق المعايطة", titleEn: "New child registered: Yousef", link: `/admin/children/${yousef.id}`, read: true, createdAt: ago(80) },
    { userId: speech.id, titleAr: "فيديوهات جديدة بانتظار التقييم", titleEn: "New videos awaiting review", link: "/specialist/reviews", createdAt: ago(5) },
    { userId: khaled.id, titleAr: "تذكير: جلسة تخاطب غداً الساعة 10:00", titleEn: "Reminder: speech session tomorrow at 10:00", link: "/parent", createdAt: ago(2) },
    { userId: khaled.id, titleAr: "قيّمت الأخصائية فيديو مهمة «طلب الأشياء بكلمة» ⭐", titleEn: "Specialist rated your video ⭐", link: "/parent/progress", createdAt: ago(26), read: true },
  ]);

  // chat history for Sara
  await db.insert(schema.chatMessages).values([
    { childId: sara.id, userId: khaled.id, role: "user", content: "كيف أطبق مهمة مؤقّت الانتظار؟", createdAt: ago(48) },
    {
      childId: sara.id,
      userId: khaled.id,
      role: "assistant",
      content: "ابدأ بشيء تحبه سارة (مثل الحلوى أو اللعبة)، واضبط المؤقّت على 30 ثانية أمامها، وقل: «ننتظر حتى يرن». عندما ينتهي امدحها وأعطها الشيء فوراً. زِد المدة تدريجياً كل يومين. الهدف أن تفهم أن الانتظار يؤدي إلى ما تريد 🌱",
      createdAt: ago(48),
    },
  ]);

  console.log("✔ Done. Demo password for all accounts:", PASSWORD);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
