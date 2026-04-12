import "dotenv/config";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma";

function resolveSqlitePath(): string {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const without = raw.replace(/^file:/, "");
  return path.isAbsolute(without)
    ? without
    : path.join(process.cwd(), without);
}

const adapter = new PrismaBetterSqlite3({ url: resolveSqlitePath() });
const prisma = new PrismaClient({ adapter });

const hash = (p: string) => bcrypt.hashSync(p, 10);

async function main() {
  await prisma.forumPost.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.badgeDefinition.deleteMany();
  await prisma.user.deleteMany();

  const teacher = await prisma.user.create({
    data: {
      email: "enseignant@demo.fr",
      passwordHash: hash("demo123"),
      name: "أستاذة فاطمة",
      role: "TEACHER",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "eleve@demo.fr",
      passwordHash: hash("demo123"),
      name: "أحمد بن علي",
      role: "STUDENT",
    },
  });

  await prisma.user.create({
    data: {
      email: "parent@demo.fr",
      passwordHash: hash("demo123"),
      name: "ولي أمر أحمد",
      role: "PARENT",
      linkedStudentId: student.id,
    },
  });

  await prisma.badgeDefinition.createMany({
    data: [
      {
        slug: "jeune-physicien",
        name: "فيزيائي صغير",
        description: "أتمّ تمارين درس في الإيقاظ العلمي.",
      },
      {
        slug: "expert-ecosystemes",
        name: "خبير في البيئات",
        description: "إتقان متقدم في السلاسل الغذائية.",
      },
      {
        slug: "geometre",
        name: "مهندس هندسة صغير",
        description: "نجاح ملحوظ في التصور الهندسي.",
      },
    ],
  });

  const badges = await prisma.badgeDefinition.findMany();
  const geo = badges.find((b) => b.slug === "geometre");
  if (geo) {
    await prisma.userBadge.create({
      data: { userId: student.id, badgeId: geo.id },
    });
  }

  const l1 = await prisma.lesson.create({
    data: {
      title: "دوائر كهربائية بسيطة",
      subject: "SCIENCE",
      description: "فهم التوصيل على التوالي والتوازي بمخططات تفاعلية.",
      sequenceOrder: 1,
      authorId: teacher.id,
      courseHtml: `<h3>الدائرة الكهربائية</h3>
        <p><strong>الدائرة الكهربائية</strong> تسمح للتيار بالمرور بين مصدر ومستقبلات.</p>
        <ul><li>على التوالي: مسار واحد للتيار.</li><li>على التوازي: عدة فروع مستقلة.</li></ul>
        <p>لإضاءة المصباح يجب أن تكون الدائرة <strong>مغلقة</strong> مع وجود مصدر طاقة (بطارية).</p>`,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "المغناطيس والمجال المغناطيسي",
      subject: "SCIENCE",
      description: "القطب الشمالي/الجنوبي والتفاعلات.",
      sequenceOrder: 2,
      authorId: teacher.id,
      courseHtml: `<p>المغناطيس يجذب الحديد وله قطبان. الأقطاب المتشابهة <strong>تنفر</strong>.</p>`,
    },
  });

  const l3 = await prisma.lesson.create({
    data: {
      title: "الكسور والتقسيم",
      subject: "MATH",
      description: "تمثيل الأجزاء المتساوية ومقارنة الكسور.",
      sequenceOrder: 1,
      authorId: teacher.id,
      courseHtml: `<h3>ما هي الكسور؟</h3>
        <p>الكسر يعبّر عن عدد الأجزاء المأخوذة من كُلٍّ مقسّم إلى أجزاء <strong>متساوية</strong>.</p>
        <p>مثال: ٢/٤ تعني أخذ جزأين من أربعة أجزاء متساوية.</p>`,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "المساحات والحجوم",
      subject: "MATH",
      description: "من المستوى إلى الفضاء.",
      sequenceOrder: 2,
      authorId: teacher.id,
      courseHtml: `<p>المساحة تقيس سطحًا؛ الحجم يقيس المكان الذي يشغله جسم صلب.</p>`,
    },
  });

  // ─── اختبار ١: الدائرة الكهربائية (علوم) ───
  const exam1 = await prisma.exam.create({
    data: {
      title: "اختبار الدائرة الكهربائية",
      subject: "SCIENCE",
      lessonId: l1.id,
      authorId: teacher.id,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        examId: exam1.id,
        type: "MCQ",
        questionText: "لتضيء المصباح، نحتاج إلى:",
        options: JSON.stringify([
          { id: "a", label: "سلك مقطوع" },
          { id: "b", label: "دائرة مغلقة مع مصدر" },
          { id: "c", label: "مغناطيس فقط" },
        ]),
        correctAnswer: "b",
        explanation: "المصباح يحتاج دائرة مغلقة ومصدر طاقة.",
        displayOrder: 1,
      },
      {
        examId: exam1.id,
        type: "CHECKBOX",
        questionText: "أي من هذه المواد ناقلة للتيار الكهربائي؟",
        options: JSON.stringify([
          { id: "a", label: "النحاس" },
          { id: "b", label: "الخشب" },
          { id: "c", label: "الألمنيوم" },
          { id: "d", label: "البلاستيك" },
        ]),
        correctAnswer: JSON.stringify(["a", "c"]),
        explanation: "النحاس والألمنيوم من المعادن الناقلة للكهرباء.",
        displayOrder: 2,
      },
      {
        examId: exam1.id,
        type: "TRUE_FALSE",
        questionText: "الدائرة المفتوحة تسمح بمرور التيار الكهربائي.",
        correctAnswer: "false",
        explanation: "لا، يجب أن تكون الدائرة مغلقة لمرور التيار.",
        displayOrder: 3,
      },
      {
        examId: exam1.id,
        type: "FILL",
        questionText: "لكي يضيء المصباح يجب أن تكون الدائرة ___.",
        correctAnswer: JSON.stringify(["مغلقة", "مقفلة", "مغلقه"]),
        hint: "فكّر: ما عكس مفتوحة؟",
        displayOrder: 4,
      },
      {
        examId: exam1.id,
        type: "ORDER",
        questionText: "رتّب خطوات بناء دائرة كهربائية بسيطة:",
        correctAnswer: JSON.stringify([
          "اختيار البطارية",
          "توصيل السلك بالقطب الموجب",
          "ربط المصباح",
          "توصيل السلك بالقطب السالب",
        ]),
        displayOrder: 5,
      },
      {
        examId: exam1.id,
        type: "MATCH",
        questionText: "وصّل كل عنصر بوظيفته:",
        correctAnswer: JSON.stringify([
          { left: "البطارية", right: "مصدر الطاقة" },
          { left: "المصباح", right: "تحويل كهرباء إلى ضوء" },
          { left: "المفتاح", right: "فتح وغلق الدائرة" },
          { left: "السلك", right: "نقل التيار الكهربائي" },
        ]),
        displayOrder: 6,
      },
    ],
  });

  // ─── اختبار ٢: الكسور (رياضيات) ───
  const exam2 = await prisma.exam.create({
    data: {
      title: "اختبار الكسور",
      subject: "MATH",
      lessonId: l3.id,
      authorId: teacher.id,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        examId: exam2.id,
        type: "MCQ",
        questionText: "نقسم بيتزا إلى ٤ أجزاء متساوية ونأكل ٢. ما الكسر المأكول؟",
        options: JSON.stringify([
          { id: "a", label: "١/٤" },
          { id: "b", label: "٢/٤ (أو ١/٢)" },
          { id: "c", label: "٤/٢" },
        ]),
        correctAnswer: "b",
        explanation: "الربعان يساويان النصف.",
        displayOrder: 1,
      },
      {
        examId: exam2.id,
        type: "CHECKBOX",
        questionText: "أي من هذه الكسور تساوي النصف؟",
        options: JSON.stringify([
          { id: "a", label: "٢/٤" },
          { id: "b", label: "١/٣" },
          { id: "c", label: "٣/٦" },
          { id: "d", label: "٢/٥" },
        ]),
        correctAnswer: JSON.stringify(["a", "c"]),
        explanation: "٢/٤ و ٣/٦ كلاهما يساوي ١/٢ عند التبسيط.",
        displayOrder: 2,
      },
      {
        examId: exam2.id,
        type: "TRUE_FALSE",
        questionText: "الكسر ٣/٤ أكبر من الكسر ٢/٣.",
        correctAnswer: "true",
        explanation: "٣/٤ = ٠٫٧٥ بينما ٢/٣ ≈ ٠٫٦٧، لذلك ٣/٤ أكبر.",
        displayOrder: 3,
      },
      {
        examId: exam2.id,
        type: "FILL",
        questionText: "الكسر ٢/٤ يُبسَّط إلى ___.",
        correctAnswer: JSON.stringify(["١/٢", "1/2", "نصف"]),
        hint: "قسّم البسط والمقام على عامل مشترك.",
        displayOrder: 4,
      },
      {
        examId: exam2.id,
        type: "ORDER",
        questionText: "رتّب الكسور من الأصغر إلى الأكبر:",
        correctAnswer: JSON.stringify(["١/٤", "١/٣", "١/٢", "٣/٤"]),
        displayOrder: 5,
      },
      {
        examId: exam2.id,
        type: "MATCH",
        questionText: "وصّل كل كسر بما يعادله:",
        correctAnswer: JSON.stringify([
          { left: "١/٢", right: "٥٠٪" },
          { left: "١/٤", right: "٢٥٪" },
          { left: "٣/٤", right: "٧٥٪" },
          { left: "١/١", right: "١٠٠٪" },
        ]),
        displayOrder: 6,
      },
    ],
  });

  await prisma.progress.create({
    data: {
      userId: student.id,
      lessonId: l1.id,
      coursDone: true,
      exercicesDone: true,
      evaluationDone: true,
      evaluationScore: 85,
    },
  });

  const thread = await prisma.forumThread.create({
    data: {
      lessonId: l1.id,
      title: "أسئلة عن الدائرة على التوالي",
    },
  });

  await prisma.forumPost.create({
    data: {
      threadId: thread.id,
      userId: student.id,
      body: "هل المصباح يضيء أقل إذا أضفنا مقاومة على التوالي؟",
    },
  });

  await prisma.forumPost.create({
    data: {
      threadId: thread.id,
      userId: teacher.id,
      body: "نعم، غالبًا يقلّ التيار قليلًا: ملاحظة جيدة!",
    },
  });

  await prisma.portfolioItem.create({
    data: {
      userId: student.id,
      title: "مخطط دائرة منزلي",
      kind: "SCHEMA",
      description: "مصابيح على التوازي مع بطاريتين.",
    },
  });

  await prisma.notification.create({
    data: {
      userId: student.id,
      title: "مرحبًا",
      body: "يمكنك استعراض نتائج أحمد وإرسال رسائل تشجيع.",
    },
  });

  console.log("تم التهيئة — حسابات تجريبية:");
  console.log("  معلّم: enseignant@demo.fr / demo123");
  console.log("  تلميذ: eleve@demo.fr / demo123");
  console.log("  ولي أمر: parent@demo.fr / demo123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
