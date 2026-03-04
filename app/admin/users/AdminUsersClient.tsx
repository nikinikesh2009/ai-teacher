"use client";

import { useState, useEffect } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created: string;
  status: string;
};

const columns: Column<User>[] = [
  { key: "id", label: "User ID", render: (r) => <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span> },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role", render: (r) => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{r.role}</span> },
  { key: "created", label: "Created" },
  { key: "status", label: "Status", render: (r) => <span className={r.status === "Active" ? "text-emerald-600" : "text-amber-600"}>{r.status}</span> },
];

export function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "User", status: "Active" });
  const [userToolsOpen, setUserToolsOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const generatePassword = () => {
    const length = 14;
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%&*";
    const all = upper + lower + numbers + symbols;
    let pwd = "";
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += lower[Math.floor(Math.random() * lower.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 4; i < length; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    pwd = pwd
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
    setPasswordForm({ password: pwd, confirm: pwd });
  };

  const copyPassword = () => {
    if (!passwordForm.password) return;
    navigator.clipboard.writeText(passwordForm.password).then(() => {
      // Optional: brief "Copied!" feedback
    });
  };

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUsers(data.users ?? []);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setEditOpen(true);
    setActionMenu(null);
  };

  const saveEdit = () => {
    if (!selectedUser) return;

    const nextUser: User = {
      ...selectedUser,
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
    };

    // Optimistic UI
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? nextUser : u))
    );
    setEditOpen(false);
    setSelectedUser(null);

    // Persist email / status (role is UI-only here)
    fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedUser.id,
        email: form.email,
        status: form.status,
      }),
    }).catch(() => {
      // Reload on failure
      load();
    });
  };

  const toggleSuspend = (user: User) => {
    const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: nextStatus } : u
      )
    );
    setActionMenu(null);

    // Persist to backend
    fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: user.id, status: nextStatus }),
    }).catch(() => {
      // Roll back on error
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: user.status } : u
        )
      );
    });
  };

  const openChangeEmail = (user: User) => {
    setSelectedUser(user);
    setForm((f) => ({ ...f, email: user.email }));
    setEditOpen(true);
    setActionMenu(null);
  };

  const openResetPassword = (user: User) => {
    setSelectedUser(user);
    setPasswordForm({ password: "", confirm: "" });
    setShowPassword(false);
    setShowConfirm(false);
    setPasswordOpen(true);
    setActionMenu(null);
  };

  const savePassword = () => {
    if (!selectedUser) return;
    if (!passwordForm.password || passwordForm.password !== passwordForm.confirm) {
      alert("Passwords do not match.");
      return;
    }

    fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedUser.id,
        password: passwordForm.password,
      }),
    })
      .then(() => {
        setPasswordOpen(false);
        setSelectedUser(null);
        setPasswordForm({ password: "", confirm: "" });
      })
      .catch(() => {
        alert("Failed to update password.");
      });
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const suspendedUsers = users.filter((u) => u.status === "Suspended").length;

  const tableUsers =
    userSearch.trim().length === 0
      ? users
      : users.filter((u) =>
          u.email.toLowerCase().includes(userSearch.trim().toLowerCase())
        );

  const activityPercent =
    totalUsers === 0 ? 0 : Math.round((activeUsers / totalUsers) * 100);
  const suspendedPercent =
    totalUsers === 0 ? 0 : Math.round((suspendedUsers / totalUsers) * 100);

  const filteredByEmail =
    searchEmail.trim().length === 0
      ? users
      : users.filter((u) =>
          u.email.toLowerCase().includes(searchEmail.trim().toLowerCase())
        );

  if (loading && users.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading users...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setUserToolsOpen(true)}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Add user
        </button>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <DataTable
        columns={columns}
        data={tableUsers}
        keyField="id"
        emptyMessage="No users"
        actions={(row) => (
          <div className="relative inline-block">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActionMenu(actionMenu === row.id ? null : row.id);
              }}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Actions"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {actionMenu === row.id && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button type="button" onClick={() => openEdit(row)} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Edit user</button>
                <button type="button" onClick={() => openChangeEmail(row)} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Change email</button>
                <button type="button" onClick={() => openResetPassword(row)} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Reset password</button>
                <button
                  type="button"
                  onClick={() => toggleSuspend(row)}
                  className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {row.status === "Suspended" ? "Unsuspend account" : "Suspend account"}
                </button>
                <button type="button" onClick={() => setActionMenu(null)} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50">Delete user</button>
              </div>
            )}
          </div>
        )}
      />

      <ModalForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit user"
        footer={
          <>
            <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={saveEdit} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Save changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="User">User</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Account status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </ModalForm>

      <ModalForm
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Reset password"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPasswordOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={savePassword}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Save password
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-700">
              New password
            </label>
            <button
              type="button"
              onClick={generatePassword}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Auto-generate
            </button>
          </div>
          <div className="flex gap-1">
            <input
              type={showPassword ? "text" : "password"}
              value={passwordForm.password}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, password: e.target.value }))
              }
              className="mt-1 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="mt-1 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              title={showPassword ? "Hide" : "Show"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={copyPassword}
              disabled={!passwordForm.password}
              className="mt-1 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
              title="Copy password"
              aria-label="Copy password"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <div className="flex gap-1">
              <input
                type={showConfirm ? "text" : "password"}
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, confirm: e.target.value }))
                }
                className="mt-1 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="mt-1 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                title={showConfirm ? "Hide" : "Show"}
                aria-label={showConfirm ? "Hide confirm" : "Show confirm"}
              >
                {showConfirm ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </ModalForm>

      <ModalForm
        isOpen={userToolsOpen}
        onClose={() => setUserToolsOpen(false)}
        title="User tools & insights"
        footer={
          <button
            type="button"
            onClick={() => setUserToolsOpen(false)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Search user by email
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="text-xs text-slate-500 whitespace-nowrap">
                {searchEmail.trim()
                  ? `${filteredByEmail.length} match${
                      filteredByEmail.length === 1 ? "" : "es"
                    }`
                  : `${totalUsers} users`}
              </div>
            </div>
            {searchEmail.trim() && (
              <div className="mt-3 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-2">
                {filteredByEmail.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No users found for this email.
                  </p>
                ) : (
                  filteredByEmail.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-md bg-white px-2 py-1 text-xs"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{u.name}</p>
                        <p className="text-slate-500">{u.email}</p>
                      </div>
                      <span
                        className={
                          u.status === "Active"
                            ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                            : "rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                        }
                      >
                        {u.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-800">
              User charts
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Total users</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {totalUsers}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Active</p>
                <p className="mt-1 text-lg font-semibold text-emerald-700">
                  {activeUsers}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${activityPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {activityPercent}% of users
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Suspended</p>
                <p className="mt-1 text-lg font-semibold text-amber-700">
                  {suspendedUsers}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${suspendedPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {suspendedPercent}% of users
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-800">
              Suspended users
            </h3>
            {suspendedUsers === 0 ? (
              <p className="text-sm text-slate-500">
                There are currently no suspended accounts.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => u.status === "Suspended")
                      .map((u) => (
                        <tr key={u.id} className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-800">
                            {u.name}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {u.email}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {u.role}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </ModalForm>
    </>
  );
}
