export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
        <p className="mt-4 text-sm text-gray-500">読み込み中...</p>
      </div>
    </div>
  );
}