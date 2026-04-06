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

  const parent = await prisma.user.create({
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
        description: "إتقان متقدم في السلاسل الغذائية (للفتح لاحقًا).",
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
      courseHtml: `<p><strong>الدائرة الكهربائية</strong> تسمح للتيار بالمرور بين مصدر ومستقبلات.</p>
        <p>على التوالي: مسار واحد؛ على التوازي: عدة فروع.</p>`,
    },
  });

  const l2 = await prisma.lesson.create({
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
      courseHtml: `<p>الكسور يعبّر عن عدد الأجزاء المأخوذة من كُل مقسّم إلى أجزاء <strong>متساوية</strong>.</p>`,
    },
  });

  const l4 = await prisma.lesson.create({
    data: {
      title: "المساحات والحجوم",
      subject: "MATH",
      description: "من المستوى إلى الفضاء.",
      sequenceOrder: 2,
      authorId: teacher.id,
      courseHtml: `<p>المساحة تقيس سطحًا؛ الحجم يقيس المكان الذي يشغله جسم صلب.</p>`,
    },
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
      userId: parent.id,
      title: "مرحبًا",
      body: "يمكنك استعراض نتائج أحمد وإرسال رسائل تشجيع.",
    },
  });

  console.log("Seed OK — حسابات تجريبية:");
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
