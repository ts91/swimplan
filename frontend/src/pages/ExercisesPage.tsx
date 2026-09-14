import { useExercises } from '../hooks/useExercises'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ExercisesPage() {
  const { data: exercises, isLoading, error } = useExercises()
  useDocumentTitle('Exercises')

  if (isLoading) return <p className="text-gray-500 dark:text-gray-400">Loading exercises...</p>
  if (error) return <p className="text-red-600">Failed to load exercises.</p>

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {exercises?.map((ex) => (
          <li key={ex.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {ex.name}
                <span className="ml-2 text-sm text-gray-400 dark:text-gray-500">({ex.abbrev})</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{ex.description}</p>
            </div>
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-300">
                {ex.category}
              </span>
              {ex.equipment?.map((eq) => (
                <span key={eq.id} className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
                  {eq.name}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
