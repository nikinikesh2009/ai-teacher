"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  totalUsers: number;
  totalLessons: number;
  totalFlashcards: number;
  aiUsage: number;
  aiRequestsToday: number;
  reportsCount: number;
  reportsPending: number;
  activeDiscussions: number;
};

export function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError("Failed to load stats"));
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading metrics...</p>
      </div>
    );
  }

  const maxChart = Math.max(stats.totalUsers, 1);
  const chartHeights = [0.3, 0.45, 0.55, 0.7, 0.85, 0.92, 0.97, 1].map(
    (p) => (stats.totalUsers * p) / maxChart
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total users" value={stats.totalUsers} href="/admin/users" />
        <StatCard label="Total lessons" value={stats.totalLessons} href="/admin/lessons" />
        <StatCard label="Total flashcards" value={stats.totalFlashcards} href="/admin/flashcards" />
        <StatCard label="AI requests today" value={stats.aiRequestsToday} />
        <StatCard label="Active discussions" value={stats.activeDiscussions} />
        <StatCard label="Reports pending" value={stats.reportsPending} href="/admin/reports" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">User growth (estimate)</h3>
          <div className="flex h-40 items-end gap-1">
            {chartHeights.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-blue-500/80 transition-all hover:bg-blue-500"
                style={{ height: `${(val / maxChart) * 100}%` }}
                title={`${Math.round(val)}`}
              />
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-500">Total users: {stats.totalUsers}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Platform overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Lessons</span>
              <span className="font-medium">{stats.totalLessons}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Flashcards</span>
              <span className="font-medium">{stats.totalFlashcards}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total AI requests</span>
              <span className="font-medium">{stats.aiUsage}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Reports</h3>
        <p className="text-sm text-slate-600">
          {stats.reportsPending} pending of {stats.reportsCount} total.
        </p>
        <Link
          href="/admin/reports"
          className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          View reports →
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value.toLocaleString()}</p>
    </>
  );
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {href ? (
        <Link href={href} className="block text-blue-600 hover:text-blue-700">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
