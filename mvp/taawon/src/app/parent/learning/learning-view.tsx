"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Lightbulb, 
  Package, 
  ListOrdered,
  Star,
  Search
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { DomainBadge } from "@/components/child/plan-view";
import { useT } from "@/i18n/client";

export interface LearningActivity {
  id: string;
  title: string;
  desc: string;
  domain: "communication" | "behavior" | "cognitive" | "daily_living";
  duration: number;
  type: string;
  difficulty: "مبتدئ" | "متوسط" | "متقدم";
  materials: string[];
  goal: string;
  steps: string[];
  specialistTip: string;
}

export function LearningView({ 
  activities,
  childName 
}: { 
  activities: LearningActivity[];
  childName: string;
}) {
  const { t } = useT();
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeActivity, setActiveActivity] = useState<LearningActivity | null>(null);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [ratingSuccess, setRatingSuccess] = useState<string | null>(null);

  const filtered = activities.filter((act) => {
    const matchesDomain = selectedDomain === "all" || act.domain === selectedDomain;
    const matchesSearch = 
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const handleToggleComplete = (id: string) => {
    setCompletedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setRatingSuccess(id);
    setTimeout(() => setRatingSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Search and Domain Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأنشطة والتمارين المنزلية..."
            className="w-full rounded-xl border border-line bg-white ps-9 pe-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "جميع المجالات" },
            { id: "communication", label: "النطق والتواصل" },
            { id: "behavior", label: "تعديل السلوك" },
            { id: "cognitive", label: "المهارات الإدراكية" },
            { id: "daily_living", label: "المهارات الحياتية" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDomain(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedDomain === tab.id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-surface-elevated text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((act) => {
          const isDone = !!completedIds[act.id];

          return (
            <Card
              key={act.id}
              className={`group flex flex-col justify-between p-5 border-line transition-all hover:shadow-pop hover:border-brand-300 ${
                isDone ? "bg-emerald-50/40 border-emerald-200" : "bg-white"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <DomainBadge domain={act.domain} t={t} />
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-muted">
                      <Clock className="size-3" />
                      {act.duration} دقيقة
                    </span>
                    {isDone && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="size-3" />
                        تم التطبيق
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-ink group-hover:text-brand-600 transition-colors">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {act.desc}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                    المستوى: {act.difficulty}
                  </span>
                  <span>•</span>
                  <span>{act.materials.length} أدوات منزلية</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-3 text-xs">
                <button
                  onClick={() => setActiveActivity(act)}
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-800 transition"
                >
                  <PlayCircle className="size-4" />
                  <span>عرض خطوات التطبيق</span>
                </button>

                <button
                  onClick={() => handleToggleComplete(act.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    isDone
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-surface text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {isDone ? "إلغاء التحديد" : "سجل كمنجز ✓"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center text-muted">
          لا توجد أنشطة تطابق معايير البحث المحددة.
        </Card>
      )}

      {/* Activity Details Modal */}
      {activeActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setActiveActivity(null)}
              className="absolute end-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-5" />
            </button>

            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DomainBadge domain={activeActivity.domain} t={t} />
                <Badge tone="teal" className="text-xs">
                  {activeActivity.type}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="size-3.5" />
                  {activeActivity.duration} دقيقة
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                {activeActivity.title}
              </h2>
              <p className="text-sm text-slate-600">
                {activeActivity.desc}
              </p>
            </div>

            {/* Target Goal */}
            <div className="mt-6 rounded-xl bg-brand-50/60 border border-brand-100 p-4">
              <div className="flex items-center gap-2 text-brand-900 font-semibold text-xs sm:text-sm">
                <Sparkles className="size-4 text-brand-600" />
                <span>الهدف التأهيلي المرجو مع {childName}:</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-brand-800 leading-relaxed">
                {activeActivity.goal}
              </p>
            </div>

            {/* Materials */}
            <div className="mt-6 space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-ink text-sm">
                <Package className="size-4 text-slate-500" />
                <span>الأدوات المنزلية المقترحة:</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeActivity.materials.map((mat, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-surface px-3 py-1.5 text-xs text-slate-700 font-medium border border-line"
                  >
                    ✓ {mat}
                  </span>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="mt-6 space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-ink text-sm">
                <ListOrdered className="size-4 text-slate-500" />
                <span>طريقة التطبيق خطوة بخطوة للأسرة:</span>
              </h3>
              <div className="space-y-2.5">
                {activeActivity.steps.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-line/70 bg-slate-50/50 p-3"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-0.5">
                      {st}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialist Tip */}
            <div className="mt-6 rounded-xl bg-amber-50/80 border border-amber-200 p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                <Lightbulb className="size-4 text-amber-600" />
                <span>نصيحة الأخصائي للتغلب على أي صعوبة:</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-amber-800 leading-relaxed">
                {activeActivity.specialistTip}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line pt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Star className="size-4 text-amber-400 fill-amber-400" />
                <span>نشاط مقترح متوافق مع الخطة التأهيلية</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setActiveActivity(null)}
                  className="flex-1 sm:flex-none"
                >
                  إغلاق
                </Button>
                <Button
                  variant={completedIds[activeActivity.id] ? "secondary" : "primary"}
                  onClick={() => handleToggleComplete(activeActivity.id)}
                  className="flex-1 sm:flex-none gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  <span>
                    {completedIds[activeActivity.id]
                      ? "تم التطبيق اليوم بنجاح ✓"
                      : "تسجيل إنجاز النشاط مع الطفل"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
