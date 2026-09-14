import type { PlanItem, WorkoutPlan } from '../api/workouts'
import { Badge } from './ui'

export function PlanDisplay({ plan }: { plan: WorkoutPlan }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{plan.name}</h2>
        <Badge color="blue">{plan.total_meters}m total</Badge>
      </div>

      <PhaseSection title="Warmup" items={plan.warmup} color="amber" />
      <PhaseSection title="Main Set" items={plan.main_set} color="blue" />
      <PhaseSection title="Cooldown" items={plan.cooldown} color="green" />
    </div>
  )
}

export function PhaseSection({ title, items, color }: { title: string; items: PlanItem[]; color: string }) {
  if (!items || items.length === 0) return null

  const bgColor = { amber: 'bg-amber-50 dark:bg-amber-900/20', blue: 'bg-blue-50 dark:bg-blue-900/20', green: 'bg-green-50 dark:bg-green-900/20' }[color] ?? 'bg-gray-50 dark:bg-gray-800'
  const headerColor = { amber: 'text-amber-800 dark:text-amber-300', blue: 'text-blue-800 dark:text-blue-300', green: 'text-green-800 dark:text-green-300' }[color] ?? 'text-gray-800 dark:text-gray-200'
  const badgeColorMap: Record<string, 'amber' | 'blue' | 'green'> = { amber: 'amber', blue: 'blue', green: 'green' }
  const badgeColor = badgeColorMap[color] ?? 'gray' as const

  const phaseTotal = items.reduce((sum, it) => sum + it.sets * it.distance, 0)

  return (
    <div className={`rounded-lg ${bgColor} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold ${headerColor}`}>{title}</h3>
        <Badge color={badgeColor}>{phaseTotal}m</Badge>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between rounded-md bg-white dark:bg-gray-800 px-3 py-2 shadow-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {item.name}
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">({item.abbrev})</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.notes}</p>
            </div>
            <div className="text-right text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap ml-4">
              <p>{item.sets} x {item.distance}m</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{item.rest_sec}s rest</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
