export default function AuthenticatedLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-white border-b border-gray-200" />
      <div className="flex">
        <div className="w-64 h-screen bg-white border-r border-gray-200 hidden md:block" />
        <main className="flex-1 p-4 md:ml-64 mt-16 md:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
        </main>
      </div>
    </div>
  );
}