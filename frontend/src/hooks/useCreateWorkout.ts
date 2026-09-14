import { useState, useCallback } from 'react'
import type { PlanItem, WorkoutPlan } from '../api/workouts'

export interface BuilderItem extends PlanItem {
  localId: string
}

interface BuilderState {
  name: string
  warmup: BuilderItem[]
  mainSet: BuilderItem[]
  cooldown: BuilderItem[]
}

let nextId = 0
function genId() {
  return `item-${++nextId}`
}

function toBuilderItems(items: PlanItem[]): BuilderItem[] {
  return items.map((it) => ({ ...it, localId: genId() }))
}

const EMPTY_STATE: BuilderState = {
  name: 'Custom Workout',
  warmup: [],
  mainSet: [],
  cooldown: [],
}

export function useCreateWorkout() {
  const [state, setState] = useState<BuilderState>(EMPTY_STATE)

  const addItem = useCallback((phase: 'warmup' | 'mainSet' | 'cooldown', name: string, abbrev: string) => {
    const item: BuilderItem = {
      localId: genId(),
      name,
      abbrev,
      sets: 1,
      distance: 100,
      rest_sec: 20,
      notes: '',
    }
    setState((s) => ({ ...s, [phase]: [...s[phase], item] }))
  }, [])

  const updateItem = useCallback((phase: 'warmup' | 'mainSet' | 'cooldown', localId: string, updates: Partial<BuilderItem>) => {
    setState((s) => ({
      ...s,
      [phase]: s[phase].map((it) => (it.localId === localId ? { ...it, ...updates } : it)),
    }))
  }, [])

  const removeItem = useCallback((phase: 'warmup' | 'mainSet' | 'cooldown', localId: string) => {
    setState((s) => ({
      ...s,
      [phase]: s[phase].filter((it) => it.localId !== localId),
    }))
  }, [])

  const setName = useCallback((name: string) => {
    setState((s) => ({ ...s, name }))
  }, [])

  const loadPlan = useCallback((plan: WorkoutPlan) => {
    setState({
      name: plan.name,
      warmup: toBuilderItems(plan.warmup ?? []),
      mainSet: toBuilderItems(plan.main_set ?? []),
      cooldown: toBuilderItems(plan.cooldown ?? []),
    })
  }, [])

  const clearPlan = useCallback(() => {
    setState({ ...EMPTY_STATE })
  }, [])

  const toPlan = useCallback((): WorkoutPlan => {
    const strip = (items: BuilderItem[]): PlanItem[] =>
      items.map(({ localId: _, ...rest }) => rest)
    const sum = (items: BuilderItem[]) =>
      items.reduce((t, it) => t + it.sets * it.distance, 0)

    return {
      name: state.name,
      total_meters: sum(state.warmup) + sum(state.mainSet) + sum(state.cooldown),
      warmup: strip(state.warmup),
      main_set: strip(state.mainSet),
      cooldown: strip(state.cooldown),
    }
  }, [state])

  const totalMeters =
    state.warmup.reduce((t, it) => t + it.sets * it.distance, 0) +
    state.mainSet.reduce((t, it) => t + it.sets * it.distance, 0) +
    state.cooldown.reduce((t, it) => t + it.sets * it.distance, 0)

  return { state, totalMeters, addItem, updateItem, removeItem, setName, loadPlan, clearPlan, toPlan }
}
