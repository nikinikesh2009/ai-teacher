import Link from "next/link";

type DashboardHeaderProps = {
  studentName?: string;
};

export function DashboardHeader({ studentName = "Student" }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <span className="text-sm font-semibold tracking-tight">TF</span>
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-semibold tracking-tight text-gray-900">
                TutorFlow
              </span>
              <span className="text-xs text-gray-500">Learning Dashboard</span>
            </div>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="mx-4 hidden max-w-md flex-1 sm:block">
          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search lessons or topics..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </label>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Compact search icon for mobile */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 sm:hidden"
            aria-label="Search"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50"
            aria-label="Notifications"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" />
          </button>

          {/* User menu (static UI stub) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 text-left text-xs shadow-sm hover:bg-gray-50 sm:px-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-xs font-medium text-gray-900">
                  {studentName}
                </span>
                <span className="text-[11px] text-gray-500">Student</span>
              </div>
              <svg
                className="ml-1 hidden h-3 w-3 text-gray-400 sm:block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {/* Dropdown menu placeholder */}
            <div
              aria-hidden="true"
              className="hidden"
            >
              <div className="min-w-[160px] rounded-xl border border-gray-200 bg-white p-1.5 text-sm shadow-lg">
                <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">
                  <span>Profile</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">
                  <span>Settings</span>
                </button>
                <button className="mt-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2 text-red-600 hover:bg-red-50">
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

