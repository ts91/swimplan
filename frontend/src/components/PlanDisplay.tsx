import type { PlanItem, WorkoutPlan } from '../api/workouts'

export function PlanDisplay({ plan }: { plan: WorkoutPlan }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {plan.total_meters}m total
        </span>
      </div>

      <PhaseSection title="Warmup" items={plan.warmup} color="amber" />
      <PhaseSection title="Main Set" items={plan.main_set} color="blue" />
      <PhaseSection title="Cooldown" items={plan.cooldown} color="green" />
    </div>
  )
}

export function PhaseSection({ title, items, color }: { title: string; items: PlanItem[]; color: string }) {
  if (!items || items.length === 0) return null

  const bgColor = { amber: 'bg-amber-50', blue: 'bg-blue-50', green: 'bg-green-50' }[color] ?? 'bg-gray-50'
  const headerColor = { amber: 'text-amber-800', blue: 'text-blue-800', green: 'text-green-800' }[color] ?? 'text-gray-800'
  const badgeColor = {
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
  }[color] ?? 'bg-gray-100 text-gray-700'

  const phaseTotal = items.reduce((sum, it) => sum + it.sets * it.distance, 0)

  return (
    <div className={`rounded-lg ${bgColor} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold ${headerColor}`}>{title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
          {phaseTotal}m
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm">
            <div>
              <p className="font-medium text-gray-900">
                {item.name}
                <span className="ml-2 text-xs text-gray-400">({item.abbrev})</span>
              </p>
              <p className="text-xs text-gray-500">{item.notes}</p>
            </div>
            <div className="text-right text-sm text-gray-600 whitespace-nowrap ml-4">
              <p>{item.sets} x {item.distance}m</p>
              <p className="text-xs text-gray-400">{item.rest_sec}s rest</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
