import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StartLearningPanel } from "@/components/dashboard/StartLearningPanel";
import { ContinueLearning, ContinueLesson } from "@/components/dashboard/ContinueLearning";
import { LearningTools } from "@/components/dashboard/LearningTools";
import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { UserCard } from "@/components/users/UserCard";
import { UserMoment } from "@/components/users/UserMoment";
import { MomentComposer } from "@/components/users/MomentComposer";
import { BottomNav } from "@/components/dashboard/BottomNav";
import {
  getDiscoveryForUser,
  getRecentMoments,
  type UserSummary,
  type MomentSummary,
} from "@/lib/social";

type DashboardStats = {
  lessonsCompleted: number;
  flashcardsMastered: number;
  studyTimeThisWeek: string;
  learningStreakDays: number;
};

type DashboardUserSummary = UserSummary;
type DashboardMoment = MomentSummary;

type DashboardData = {
  studentName: string;
  continueLessons: ContinueLesson[];
  stats: DashboardStats;
  discoveryUsers: DashboardUserSummary[];
  recentMoments: DashboardMoment[];
};

async function getDashboardData(): Promise<DashboardData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("tutorflow_token")?.value;

  // Fallback for safety; middleware already protects this route.
  if (!token) {
    return {
      studentName: "Student",
      continueLessons: [],
      stats: {
        lessonsCompleted: 0,
        flashcardsMastered: 0,
        studyTimeThisWeek: "0 min",
        learningStreakDays: 0,
      },
      discoveryUsers: [],
      recentMoments: [],
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      studentName: "Student",
      continueLessons: [],
      stats: {
        lessonsCompleted: 0,
        flashcardsMastered: 0,
        studyTimeThisWeek: "0 min",
        learningStreakDays: 0,
      },
      discoveryUsers: [],
      recentMoments: [],
    };
  }

  const userRows = await sql`
    SELECT id, email
    FROM users
    WHERE id = ${payload.userId}
    LIMIT 1
  `;

  const userRow = userRows[0] as { id: string; email: string } | undefined;
  const userId = userRow?.id;
  const email = userRow?.email ?? "student@tutorflow.local";
  const studentName = email.split("@")[0] || "Student";

  if (!userId) {
    return {
      studentName,
      continueLessons: [],
      stats: {
        lessonsCompleted: 0,
        flashcardsMastered: 0,
        studyTimeThisWeek: "0 min",
        learningStreakDays: 0,
      },
      discoveryUsers: [],
      recentMoments: [],
    };
  }

  const lessonsRows = await sql`
    SELECT ul.id, ul.progress, ul.updated_at, l.title
    FROM user_lessons ul
    JOIN lessons l ON ul.lesson_id = l.id
    WHERE ul.user_id = ${userId}
    ORDER BY ul.updated_at DESC
    LIMIT 6
  `;

  const continueLessons: ContinueLesson[] = (lessonsRows as any[]).map((row) => {
    const progress = typeof row.progress === "number" ? row.progress : Number(row.progress ?? 0);
    const updatedAt = row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at);
    const now = new Date();
    const diffMs = now.getTime() - updatedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    let lastStudied = "Just now";
    if (diffHours >= 24) {
      const diffDays = Math.floor(diffHours / 24);
      lastStudied = diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      lastStudied = diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    }

    return {
      id: String(row.id),
      title: String(row.title),
      progressPercent: progress,
      lastStudied,
    };
  });

  const statsRows = await sql`
    SELECT
      COALESCE(SUM(CASE WHEN progress >= 100 THEN 1 ELSE 0 END), 0) AS lessons_completed,
      COALESCE(COUNT(*), 0) AS total_lessons,
      COALESCE(COUNT(DISTINCT DATE(updated_at)) FILTER (WHERE updated_at >= now() - INTERVAL '7 days'), 0) AS active_days_last_week
    FROM user_lessons
    WHERE user_id = ${userId}
  `;

  const statsRow = statsRows[0] as {
    lessons_completed: number;
    total_lessons: number;
    active_days_last_week: number;
  };

  const lessonsCompleted = Number(statsRow?.lessons_completed ?? 0);
  const activeDays = Number(statsRow?.active_days_last_week ?? 0);

  // Simple derived estimate: 20 minutes per active day this week.
  const estimatedMinutes = activeDays * 20;
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;
  const studyTimeThisWeek =
    estimatedMinutes === 0
      ? "0 min"
      : hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes} min`;

  const stats: DashboardStats = {
    lessonsCompleted,
    flashcardsMastered: 0,
    studyTimeThisWeek,
    learningStreakDays: activeDays,
  };

  let discoveryUsers: DashboardUserSummary[] = [];
  let recentMoments: DashboardMoment[] = [];

  try {
    discoveryUsers = await getDiscoveryForUser(userId);
    recentMoments = await getRecentMoments(10);
  } catch (err) {
    console.error("Dashboard social data error:", err);
  }

  return {
    studentName,
    continueLessons,
    stats,
    discoveryUsers,
    recentMoments,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader studentName={data.studentName} />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        {/* Start Learning Panel */}
        <StartLearningPanel />

        {/* Two-column layout for main content */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          <div className="space-y-6">
            {/* Continue Learning */}
            <ContinueLearning lessons={data.continueLessons} />

            {/* People With Similar Interests */}
            <section id="people" className="scroll-mt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900">
                  People With Similar Interests
                </h2>
                <p className="text-xs text-gray-500">
                  Discover learners who are exploring similar topics.
                </p>
              </div>
              {data.discoveryUsers.length === 0 ? (
                <p className="text-xs text-gray-500">
                  As more learners add interests, you&apos;ll see suggested people
                  here.
                </p>
              ) : (
                <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.discoveryUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </section>

            {/* Recent Moments */}
            <section id="moments" className="scroll-mt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900">
                  Recent Moments
                </h2>
                <p className="text-xs text-gray-500">
                  Short updates from people across TutorFlow.
                </p>
              </div>

              <MomentComposer />

              {data.recentMoments.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Be the first to share what you&apos;re learning or building.
                </p>
              ) : (
                <div className="mt-2 space-y-3">
                  {data.recentMoments.map((moment) => (
                    <UserMoment
                      key={moment.id}
                      id={moment.id}
                      userId={moment.userId}
                      username={moment.username}
                      avatarUrl={moment.avatarUrl}
                      content={moment.content}
                      createdAt={moment.createdAt}
                      likesCount={moment.likesCount}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Learning Tools */}
            <LearningTools />
          </div>

          <div className="space-y-6">
            {/* Progress Overview */}
            <ProgressOverview
              lessonsCompleted={data.stats.lessonsCompleted}
              flashcardsMastered={data.stats.flashcardsMastered}
              studyTimeThisWeek={data.stats.studyTimeThisWeek}
              learningStreakDays={data.stats.learningStreakDays}
            />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
