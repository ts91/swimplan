import { useState, useRef, useEffect } from 'react'
import { useExercises } from '../hooks/useExercises'

interface ExercisePickerProps {
  onSelect: (name: string, abbrev: string) => void
}

export function ExercisePicker({ onSelect }: ExercisePickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: exercises } = useExercises()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const filtered = exercises?.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.category.toLowerCase().includes(search.toLowerCase()),
  )

  const categories = [...new Set(exercises?.map((ex) => ex.category) ?? [])]

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setSearch('') }}
        className="flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
      >
        <span className="text-lg leading-none">+</span>
        <span>Add Exercise</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <input
              type="text"
              autoFocus
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto px-1 pb-1">
            {search === '' ? (
              categories.map((cat) => (
                <li key={cat}>
                  <p className="px-2 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase">{cat}</p>
                  {exercises
                    ?.filter((ex) => ex.category === cat)
                    .map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => { onSelect(ex.name, ex.abbrev); setOpen(false) }}
                        className="w-full text-left rounded-md px-3 py-1.5 text-sm hover:bg-blue-50 transition"
                      >
                        <span className="font-medium text-gray-900">{ex.name}</span>
                        <span className="ml-1 text-gray-400">({ex.abbrev})</span>
                        {ex.equipment?.map((eq) => (
                          <span key={eq.id} className="ml-1 text-xs text-amber-600">{eq.abbrev}</span>
                        ))}
                      </button>
                    ))}
                </li>
              ))
            ) : filtered?.length === 0 ? (
              <li className="px-3 py-4 text-sm text-gray-400 text-center">No exercises found</li>
            ) : (
              filtered?.map((ex) => (
                <li key={ex.id}>
                  <button
                    onClick={() => { onSelect(ex.name, ex.abbrev); setOpen(false) }}
                    className="w-full text-left rounded-md px-3 py-1.5 text-sm hover:bg-blue-50 transition"
                  >
                    <span className="font-medium text-gray-900">{ex.name}</span>
                    <span className="ml-1 text-gray-400">({ex.abbrev})</span>
                    <span className="ml-1 text-xs text-gray-400">{ex.category}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
