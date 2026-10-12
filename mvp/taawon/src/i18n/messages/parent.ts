/** UI strings for the parent area. Keys prefixed with "parent.". */
export const parent = {
  ar: {
    "parent.greeting": "مرحباً، {name} 👋",
    "parent.activeChild": "الطفل الحالي",
    "parent.noChildren": "لم يتم تسجيل أطفال بعد في حسابك. يرجى التواصل مع إدارة المركز.",
    "parent.childAge": "{age} سنوات",
    
    // Stages / Stepper
    "parent.stepper.title": "مسار الخطة التأهيلية",
    "parent.step.questionnaire": "الاستبيان الأولي",
    "parent.step.assessment": "تقييم الأخصائيين",
    "parent.step.planReview": "اعتماد الخطة",
    "parent.step.active": "تطبيق المهام اليومية",
    
    // Callouts by status
    "parent.statusNew.title": "ابدأ رحلة تأهيل {name}",
    "parent.statusNew.desc": "يرجى تعبئة الاستبيان الأولي ليقوم الذكاء الاصطناعي بصياغة التقرير التمهيدي للأخصائيين.",
    "parent.statusNew.cta": "تعبئة الاستبيان الآن",
    
    "parent.statusAssessment.title": "جاري التقييم السريري من الأخصائيين",
    "parent.statusAssessment.desc": "يقوم فريق التخاطب والسلوك والتربية الخاصة بدراسة التقرير وتجهيز خطة متكاملة لطفلك.",
    
    "parent.statusReview.title": "الخطة بانتظار اعتماد المدير",
    "parent.statusReview.desc": "تم دمج التقارير وصياغة مسودة الخطة عبر الذكاء الاصطناعي، ويجري اعتمادها الآن من مدير المركز.",
    
    // Dashboard widgets
    "parent.todayTasks.title": "مهام اليوم",
    "parent.todayTasks.allDone": "رائع! أنجزت جميع مهام اليوم 🎉",
    "parent.todayTasks.pendingCount": "متبقي {count} مهام لليوم",
    "parent.todayTasks.viewAll": "عرض تفاصيل المهام",
    
    "parent.nextSession.title": "الجلسة القادمة",
    "parent.nextSession.none": "لا توجد جلسات مجدولة حالياً",
    
    "parent.latestFeedback.title": "آخر تقييم من الأخصائي",
    "parent.latestFeedback.none": "لم يتم تقييم فيديوهات بعد",
    "parent.latestFeedback.stars": "التقييم: {stars} من 5 نجوم",
    
    "parent.aiChatCard.title": "استشر المساعد الذكي",
    "parent.aiChatCard.desc": "اسأل عن كيفية تطبيق المهام، أو تفسير سلوكيات الطفل وتقدمه.",
    "parent.aiChatCard.cta": "فتح المحادثة",
    
    // Tasks page
    "parent.tasks.title": "المهام اليومية المنزلية",
    "parent.tasks.subtitle": "تطبيق المهام المنزلية القصيرة يعزز مهارات طفلك ويسرع من تحقيق الأهداف",
    "parent.tasks.week": "الأسبوع {week} من 12",
    "parent.tasks.streak": "التزام الأسبوع: {days} أيام متتالية",
    "parent.tasks.howTo": "طريقة التطبيق خطوة بخطوة",
    "parent.tasks.markDone": "تم الإنجاز بدون فيديو",
    "parent.tasks.uploadVideo": "رفع فيديو توثيقي",
    "parent.tasks.doneToday": "تم الإنجاز اليوم ✓",
    "parent.tasks.videoUploaded": "تم رفع الفيديو وبانتظار تقييم الأخصائي 📹",
    "parent.tasks.uploadModal.title": "توثيق إنجاز المهمة",
    "parent.tasks.uploadModal.videoHint": "قم بتصوير مقطع قصير (30 - 60 ثانية) يوضح أداء الطفل للمهمة",
    "parent.tasks.uploadModal.noteLabel": "ملاحظاتك أثناء تطبيق المهمة (اختياري)",
    "parent.tasks.uploadModal.notePlaceholder": "مثال: استجاب بسرعة، احتاج إلى مساعدة بسيطة في البداية...",
    "parent.tasks.uploadModal.submit": "تأكيد وإرسال للأخصائي",
    "parent.tasks.uploadModal.uploading": "جاري رفع الفيديو...",
    
    // Progress page
    "parent.progress.title": "مؤشرات التطور والتقدم",
    "parent.progress.subtitle": "بيانات دقيقة مبنية على تقييمات الأخصائيين ونسب الالتزام بالمهام",
    "parent.progress.overallScore": "التقدم التراكمي",
    "parent.progress.complianceRate": "نسبة إتمام المهام",
    "parent.progress.radarTitle": "مستوى المهارات الحالية",
    "parent.progress.trendTitle": "مسار التقدم الأسبوعي",
    "parent.progress.aiInsightTitle": "تحليل الذكاء الاصطناعي لتطور الطفل",
    "parent.progress.goalsTitle": "أهداف الخطة العلاجية الحالية",
    "parent.progress.historyTitle": "سجل الملاحظات وتقييم الأخصائيين",
    
    // Chat page
    "parent.chat.title": "مساعد تعاون الذكي",
    "parent.chat.subtitle": "مستشارك السريري والتربوي للإجابة عن أسئلتك حول طفلك",
    "parent.chat.placeholder": "اكتب سؤالك هنا...",
    "parent.chat.send": "إرسال",
    "parent.chat.chip1": "ما هي مهام اليوم وكيف أطبقها؟",
    "parent.chat.chip2": "كيف أتعامل مع نوبات الغضب؟",
    "parent.chat.chip3": "ما مدى تحسن طفلي هذا الشهر؟",
    "parent.chat.chip4": "نصائح لزيادة الحصيلة اللغوية بالمنزل",
    
    // Questionnaire page
    "parent.q.title": "الاستبيان الأولي للطفل",
    "parent.q.subtitle": "إجاباتك الدقيقة تساعدنا في بناء خطة علاجية مخصصة لطفلك",
    "parent.q.alreadySubmitted": "تم استلام الاستبيان مسبقاً لهذا الطفل بنجاح",
    "parent.q.section": "القسم: {name}",
    "parent.q.scaleNever": "نادراً / لا",
    "parent.q.scaleAlways": "دائماً / نعم",
    "parent.q.step": "الخطوة {current} من {total}",
    "parent.q.analyzing": "يقوم الذكاء الاصطناعي الآن بتحليل الإجابات وتوليد التقرير الأولي...",
    "parent.q.successTitle": "تم إرسال الاستبيان بنجاح!",
    "parent.q.successDesc": "أعد الذكاء الاصطناعي التقرير الأولي وتم تحويل الملف إلى الأخصائيين للبدء بالتقييم.",
    
    // Learning page
    "parent.learning.title": "مكتبة التعلم المنزلي",
    "parent.learning.subtitle": "أنشطة تفاعلية وألعاب موجهة يدعم بها ولي الأمر طفله خارج المركز",
    "parent.learning.badge": "أنشطة منزلية موجهة",
    "parent.learning.heroTitle": "تمكين الأسرة كشريك أساسي في التأهيل",
    "parent.learning.heroDesc": "أنشطة تعليمية تفاعلية مقترحة ومصممة لدعم المهارات النمائية والسلوكية للطفل في بيئة المنزل اليومية.",
    "parent.learning.notifyBtn": "استكشاف التمارين",
    "parent.learning.notified": "تم تحديد النشاط المفضل بنجاح.",
    "parent.learning.duration": "{min} دقيقة",
  },
  en: {
    "parent.greeting": "Welcome, {name} 👋",
    "parent.activeChild": "Active child",
    "parent.noChildren": "No children registered under your account yet. Please contact center administration.",
    "parent.childAge": "{age} years old",
    
    "parent.stepper.title": "Rehabilitation Journey",
    "parent.step.questionnaire": "Questionnaire",
    "parent.step.assessment": "Assessment",
    "parent.step.planReview": "Plan Approval",
    "parent.step.active": "Daily Tasks",
    
    "parent.statusNew.title": "Start {name}'s Journey",
    "parent.statusNew.desc": "Please complete the preliminary questionnaire so AI can synthesize the initial evaluation report.",
    "parent.statusNew.cta": "Fill Questionnaire Now",
    
    "parent.statusAssessment.title": "Clinical Assessment in Progress",
    "parent.statusAssessment.desc": "Speech, behavior, and special education specialists are evaluating your child to draft a unified plan.",
    
    "parent.statusReview.title": "Treatment Plan Under Director Review",
    "parent.statusReview.desc": "Clinical reports merged and AI drafted the 3-month plan. Awaiting director's final approval.",
    
    "parent.todayTasks.title": "Today's Home Tasks",
    "parent.todayTasks.allDone": "Great job! All today's tasks completed 🎉",
    "parent.todayTasks.pendingCount": "{count} tasks remaining today",
    "parent.todayTasks.viewAll": "View task details",
    
    "parent.nextSession.title": "Upcoming Session",
    "parent.nextSession.none": "No upcoming sessions scheduled",
    
    "parent.latestFeedback.title": "Latest Specialist Feedback",
    "parent.latestFeedback.none": "No reviewed videos yet",
    "parent.latestFeedback.stars": "Rating: {stars} of 5 stars",
    
    "parent.aiChatCard.title": "Ask AI Assistant",
    "parent.aiChatCard.desc": "Ask how to implement tasks or clarify behaviors and developmental milestones.",
    "parent.aiChatCard.cta": "Start Chat",
    
    "parent.tasks.title": "Daily Home Tasks",
    "parent.tasks.subtitle": "Short, regular home tasks strengthen your child's skills and accelerate progress",
    "parent.tasks.week": "Week {week} of 12",
    "parent.tasks.streak": "Weekly consistency: {days} consecutive days",
    "parent.tasks.howTo": "Step-by-step instructions",
    "parent.tasks.markDone": "Mark Done (No Video)",
    "parent.tasks.uploadVideo": "Upload Documentation Video",
    "parent.tasks.doneToday": "Done Today ✓",
    "parent.tasks.videoUploaded": "Video uploaded, awaiting specialist review 📹",
    "parent.tasks.uploadModal.title": "Document Task Completion",
    "parent.tasks.uploadModal.videoHint": "Record a short clip (30-60 sec) demonstrating the child doing the activity",
    "parent.tasks.uploadModal.noteLabel": "Your notes during the activity (optional)",
    "parent.tasks.uploadModal.notePlaceholder": "E.g. responded quickly, needed initial guidance...",
    "parent.tasks.uploadModal.submit": "Submit to Specialist",
    "parent.tasks.uploadModal.uploading": "Uploading video...",
    
    "parent.progress.title": "Growth & Progress Indicators",
    "parent.progress.subtitle": "Precise tracking based on specialist ratings and home task consistency",
    "parent.progress.overallScore": "Cumulative Progress",
    "parent.progress.complianceRate": "Task Completion",
    "parent.progress.radarTitle": "Current Skill Profile",
    "parent.progress.trendTitle": "Weekly Progress Trajectory",
    "parent.progress.aiInsightTitle": "AI Developmental Insight",
    "parent.progress.goalsTitle": "Treatment Plan Goals",
    "parent.progress.historyTitle": "Specialist Reviews & Feedback",
    
    "parent.chat.title": "Taawon Smart Assistant",
    "parent.chat.subtitle": "Your clinical & pedagogical AI assistant for your child's care",
    "parent.chat.placeholder": "Type your question here...",
    "parent.chat.send": "Send",
    "parent.chat.chip1": "What are today's tasks and how do I do them?",
    "parent.chat.chip2": "How do I handle tantrums?",
    "parent.chat.chip3": "How has my child improved this month?",
    "parent.chat.chip4": "Tips for expanding vocabulary at home",
    
    "parent.q.title": "Initial Child Questionnaire",
    "parent.q.subtitle": "Your accurate answers help us build a tailored rehabilitation plan",
    "parent.q.alreadySubmitted": "The questionnaire for this child has already been submitted",
    "parent.q.section": "Section: {name}",
    "parent.q.scaleNever": "Rarely / No",
    "parent.q.scaleAlways": "Always / Yes",
    "parent.q.step": "Step {current} of {total}",
    "parent.q.analyzing": "AI is analyzing your responses and generating the initial report...",
    "parent.q.successTitle": "Questionnaire Submitted Successfully!",
    "parent.q.successDesc": "AI prepared the initial report and the case is forwarded to specialists for assessment.",
    
    "parent.learning.title": "Home Learning Library",
    "parent.learning.subtitle": "Interactive activities and guided exercises for parents to support learning at home",
    "parent.learning.badge": "Guided Home Activities",
    "parent.learning.heroTitle": "Empowering Parents as Key Rehab Partners",
    "parent.learning.heroDesc": "Interactive developmental exercises designed to foster speech, behavior, and cognitive growth at home.",
    "parent.learning.notifyBtn": "Explore Exercises",
    "parent.learning.notified": "Favorite activity saved.",
    "parent.learning.duration": "{min} mins",
  },
};
