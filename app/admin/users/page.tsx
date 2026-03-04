import { AdminUsersClient } from "./AdminUsersClient";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage platform users and roles
        </p>
      </div>
      <AdminUsersClient />
    </div>
  );
}
