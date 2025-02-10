export default function HealthCheck() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Health Check
          </h2>
        </div>
        <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
          <div className="text-sm text-green-700 dark:text-green-200">
            The service is up and running.
          </div>
        </div>
      </div>
    </div>
  )
}
