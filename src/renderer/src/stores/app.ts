import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DayStats, MorningPlan } from '@shared/types'

export const useAppStore = defineStore('app', () => {
  const qi = ref(0)
  const morning = ref<MorningPlan | null>(null)
  const today = ref<DayStats | null>(null)
  const loaded = ref(false)

  async function load(): Promise<void> {
    const snap = await window.api.getSnapshot()
    qi.value = snap.qi
    morning.value = snap.morning
    today.value = snap.today
    loaded.value = true
  }

  async function saveMorning(mainTask: string, todos: string[]): Promise<void> {
    morning.value = await window.api.tasks.saveToday({ mainTask, todos })
  }

  async function toggleTodo(index: number): Promise<void> {
    const plan = await window.api.tasks.toggleTodo(index)
    if (plan) morning.value = plan
  }

  async function completeMeditation(): Promise<void> {
    qi.value = await window.api.meditation.complete()
  }

  async function refreshToday(): Promise<void> {
    today.value = await window.api.observe.getToday()
  }

  return { qi, morning, today, loaded, load, saveMorning, toggleTodo, completeMeditation, refreshToday }
})
