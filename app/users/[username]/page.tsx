import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { MomentComposer } from "@/components/users/MomentComposer";
import { UserMoment } from "@/components/users/UserMoment";
import { getCurrentUserId } from "@/lib/currentUser";
import {
  getUserProfileByUsername,
  getMomentsForUser,
  type MomentSummary,
} from "@/lib/social";

type UserProfilePageProps = {
  params: {
    username: string;
  };
};

function formatJoinDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Joined recently";
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function InterestsPillList({ interests }: { interests: string[] }) {
  if (!interests.length) {
    return (
      <p className="text-xs text-gray-400">
        This learner hasn&apos;t shared any interests yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {interests.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function MomentsTab({ moments }: { moments: MomentSummary[] }) {
  if (moments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
        <h3 className="text-sm font-semibold text-gray-900">
          No moments yet
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          When this learner shares updates, they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {moments.map((m) => (
        <UserMoment
          key={m.id}
          id={m.id}
          userId={m.userId}
          username={m.username}
          avatarUrl={m.avatarUrl}
          content={m.content}
          createdAt={m.createdAt}
          likesCount={m.likesCount}
          showUserLink={false}
        />
      ))}
    </div>
  );
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const username = decodeURIComponent(params.username);
  const profile = await getUserProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const moments = await getMomentsForUser(profile.userId, 20);
  const currentUserId = await getCurrentUserId();
  const isOwnProfile = currentUserId === profile.userId;

  const initials =
    profile.username
      .split(/[\s_]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "TF";

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        <section className="space-y-4">
          <header className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-semibold text-gray-900">
                  {profile.username}
                </h1>
                {profile.bio ? (
                  <p className="text-sm text-gray-600">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-gray-400">
                    This learner hasn&apos;t written a bio yet.
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>Joined {formatJoinDate(profile.joinedAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Interests
              </span>
              <InterestsPillList interests={profile.interests} />
            </div>
          </header>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium text-gray-600">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                  Moments
                </span>
                <span className="px-3 py-1 text-gray-400">Projects</span>
                <span className="px-3 py-1 text-gray-400">Interests</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Short updates about what they&apos;re learning or building.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <MomentsTab moments={moments} />
              <div className="space-y-3">
                {isOwnProfile ? (
                  <MomentComposer />
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-500 shadow-sm">
                    <h3 className="text-xs font-semibold text-gray-900">
                      Viewing another learner&apos;s profile
                    </h3>
                    <p className="mt-1">
                      Moments on this page belong to{" "}
                      <span className="font-medium text-gray-800">
                        {profile.username}
                      </span>
                      . To share your own updates, use the dashboard or visit
                      your own profile.
                    </p>
                  </div>
                )}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-500 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-900">
                    About this space
                  </h3>
                  <p className="mt-1">
                    Moments are lightweight updates, not full posts or chats.
                    Use them to share what you&apos;re focusing on and find
                    people with similar goals.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

