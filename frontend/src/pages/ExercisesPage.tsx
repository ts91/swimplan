import { useExercises } from '../hooks/useExercises'

export function ExercisesPage() {
  const { data: exercises, isLoading, error } = useExercises()

  if (isLoading) return <p className="text-gray-500">Loading exercises...</p>
  if (error) return <p className="text-red-600">Failed to load exercises.</p>

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Exercises</h1>
      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {exercises?.map((ex) => (
          <li key={ex.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">{ex.name}</p>
              <p className="text-sm text-gray-500">{ex.description}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {ex.category}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {ex.phase}
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {ex.distance}m
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
