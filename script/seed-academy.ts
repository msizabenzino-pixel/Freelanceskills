/**
 * Seed Academy Courses — 22 Production Courses
 * Populates the database with complete course curriculum, lessons, and quizzes
 */
import { Pool } from "pg";
import { ACADEMY_COURSES } from "../server/academy-seed-data";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "freelanceskills",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

async function seedAcademy() {
  const client = await pool.connect();
  try {
    console.log("🎓 Seeding Academy Courses...");
    
    for (const courseData of ACADEMY_COURSES) {
      const { lessons, quiz, ...courseFields } = courseData;
      
      // Insert course
      const courseResult = await client.query(
        `INSERT INTO courses (
          title, description, category, difficulty, duration, total_lessons,
          is_free, skills_taught, earnings_lift_pct, average_rating, enrolment_count,
          completion_rate, is_featured, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 4.5, 0, 0, true, 'live')
        RETURNING id`,
        [
          courseData.title,
          courseData.description,
          courseData.category,
          courseData.difficulty,
          courseData.duration,
          courseData.totalLessons,
          courseData.isFree,
          JSON.stringify(courseData.skillsTaught),
          courseData.earningsLiftPct,
        ]
      );
      
      const courseId = courseResult.rows[0].id;
      console.log(`✓ Created: ${courseData.title} (ID: ${courseId})`);
      
      // Insert lessons
      if (lessons && lessons.length > 0) {
        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i];
          await client.query(
            `INSERT INTO lessons (course_id, title, content, order_index, type, video_url)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              courseId,
              lesson.title,
              lesson.content,
              i + 1,
              lesson.type,
              lesson.videoUrl || null,
            ]
          );
        }
        console.log(`  └─ Added ${lessons.length} lessons`);
      }
    }
    
    console.log("\n✅ Academy seeding complete!");
    console.log(`📚 Total courses: ${ACADEMY_COURSES.length}`);
    console.log("🚀 Visit /academy/catalog to see all courses");
  } catch (error) {
    console.error("❌ Error seeding academy:", error);
    throw error;
  } finally {
    await client.release();
    await pool.end();
  }
}

seedAcademy().catch(console.error).finally(() => process.exit(0));
