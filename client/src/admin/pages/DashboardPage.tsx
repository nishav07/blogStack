import { useAuth } from '../../shared/context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome back, {user?.name}. You are signed in as {user?.email}.
      </p>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900">Getting started</h2>
        <p className="mt-2 text-sm text-gray-600">
          Article management and publishing features will be available in the next phase.
        </p>
      </div>
    </div>
  );
}
