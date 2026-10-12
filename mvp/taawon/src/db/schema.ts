import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString());

export type Role = "admin" | "specialist" | "parent";
export type Specialty = "speech" | "special_ed" | "behavior";
export type Domain = "communication" | "cognitive" | "behavior" | "daily_living";

/** Child workflow status */
export type ChildStatus =
  | "new" // account created, waiting for questionnaire
  | "assessment" // questionnaire done, specialists writing reports
  | "plan_review" // AI plan waiting for admin
  | "active"; // approved plan running

export type PlanStatus =
  | "pending" // waiting for admin review
  | "returned_specialist" // admin sent it back to specialists
  | "approved"
  | "superseded"; // replaced by a newer version

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<Role>().notNull(),
  specialty: text("specialty").$type<Specialty>(),
  phone: text("phone"),
  createdAt: createdAt(),
});

export const children = sqliteTable("children", {
  id: id(),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  gender: text("gender").$type<"male" | "female">().notNull(),
  parentId: text("parent_id")
    .notNull()
    .references(() => users.id),
  diagnosis: text("diagnosis"),
  status: text("status").$type<ChildStatus>().notNull().default("new"),
  createdAt: createdAt(),
});

export const assignments = sqliteTable("assignments", {
  id: id(),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  specialistId: text("specialist_id")
    .notNull()
    .references(() => users.id),
  createdAt: createdAt(),
});

export const questions = sqliteTable("questions", {
  id: id(),
  section: text("section").notNull(), // section key
  textAr: text("text_ar").notNull(),
  textEn: text("text_en").notNull(),
  type: text("type").$type<"text" | "choice" | "scale">().notNull(),
  /** JSON array of {ar,en} for choice questions */
  options: text("options"),
  order: integer("order").notNull().default(0),
});

export const questionnaireResponses = sqliteTable("questionnaire_responses", {
  id: id(),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  /** JSON: Record<questionId, string> */
  answers: text("answers").notNull(),
  createdAt: createdAt(),
});

export type InitialReportContent = {
  summary: string;
  strengths: string[];
  challenges: string[];
  behaviors: string[];
  recommendations: string[];
};

export const initialReports = sqliteTable("initial_reports", {
  id: id(),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  content: text("content", { mode: "json" }).$type<InitialReportContent>().notNull(),
  source: text("source").$type<"ai" | "demo">().notNull(),
  createdAt: createdAt(),
});

export const clinicalReports = sqliteTable("clinical_reports", {
  id: id(),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  specialistId: text("specialist_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: createdAt(),
  updatedAt: text("updated_at"),
});

export type PlanTaskContent = {
  title: string;
  description: string;
  howTo: string;
  domain: Domain;
};
export type PlanPhase = {
  week: number;
  title: string;
  focus: string;
  tasks: PlanTaskContent[];
};
export type PlanContent = {
  unifiedInsight: string;
  goals: { domain: Domain; goal: string }[];
  phases: PlanPhase[];
};

export const plans = sqliteTable("plans", {
  id: id(),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  status: text("status").$type<PlanStatus>().notNull().default("pending"),
  content: text("content", { mode: "json" }).$type<PlanContent>().notNull(),
  adminNotes: text("admin_notes"),
  source: text("source").$type<"ai" | "demo" | "manual">().notNull(),
  startDate: text("start_date"),
  approvedAt: text("approved_at"),
  createdAt: createdAt(),
});

/** Concrete tasks created when a plan is approved. Each task repeats daily during its week. */
export const planTasks = sqliteTable("plan_tasks", {
  id: id(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  week: integer("week").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  howTo: text("how_to").notNull(),
  domain: text("domain").$type<Domain>().notNull(),
});

export const submissions = sqliteTable("submissions", {
  id: id(),
  taskId: text("task_id")
    .notNull()
    .references(() => planTasks.id, { onDelete: "cascade" }),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  videoUrl: text("video_url"),
  note: text("note"),
  rating: integer("rating"), // 1..5 by specialist
  feedback: text("feedback"),
  evaluatedBy: text("evaluated_by").references(() => users.id),
  evaluatedAt: text("evaluated_at"),
  createdAt: createdAt(),
});

export const sessions = sqliteTable("sessions", {
  id: id(),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  specialistId: text("specialist_id")
    .notNull()
    .references(() => users.id),
  startsAt: text("starts_at").notNull(),
  durationMin: integer("duration_min").notNull().default(45),
  type: text("type").$type<"in_person" | "online">().notNull().default("in_person"),
  status: text("status").$type<"scheduled" | "done" | "cancelled">().notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const notifications = sqliteTable("notifications", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  bodyAr: text("body_ar"),
  bodyEn: text("body_en"),
  link: text("link"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: id(),
  childId: text("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").$type<"user" | "assistant">().notNull(),
  content: text("content").notNull(),
  createdAt: createdAt(),
});

export type User = typeof users.$inferSelect;
export type Child = typeof children.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type PlanTask = typeof planTasks.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type ClinicalReport = typeof clinicalReports.$inferSelect;
