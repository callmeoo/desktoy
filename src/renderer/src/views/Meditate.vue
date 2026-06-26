<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { PetState } from '@shared/types'
import PetSprite from '../components/PetSprite.vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const { qi } = storeToRefs(store)

const TOTAL = 25 * 60
const RADIUS = 96
const CIRC = 2 * Math.PI * RADIUS

type Status = 'idle' | 'running' | 'paused' | 'done'
const status = ref<Status>('idle')
const remaining = ref(TOTAL)
const justGained = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const progress = computed(() => (TOTAL - remaining.value) / TOTAL)
const dashOffset = computed(() => CIRC * (1 - progress.value))
const mmss = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
const petState = computed<PetState>(() => {
  if (status.value === 'running') return 'meditate'
  if (status.value === 'done') return 'happy'
  return 'idle'
})

function clear(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function tick(): void {
  remaining.value -= 1
  if (remaining.value <= 0) void finish()
}

function start(): void {
  if (status.value === 'running') return
  status.value = 'running'
  justGained.value = false
  window.api.pet.setState('meditate')
  clear()
  timer = setInterval(tick, 1000)
}

function pause(): void {
  status.value = 'paused'
  clear()
  window.api.pet.resetState()
}

function reset(): void {
  clear()
  status.value = 'idle'
  remaining.value = TOTAL
  justGained.value = false
  window.api.pet.resetState()
}

async function finish(): Promise<void> {
  clear()
  remaining.value = 0
  status.value = 'done'
  await store.completeMeditation()
  justGained.value = true
  window.api.pet.setState('happy')
  setTimeout(() => window.api.pet.resetState(), 4000)
}

onBeforeUnmount(() => {
  clear()
  if (status.value === 'running') window.api.pet.resetState()
})
</script>

<template>
  <div class="page meditate">
    <div class="page-head center">
      <h1 class="page-title">入定</h1>
      <span class="page-sub">二十五分钟，只与此刻同在。心若止水，万事自清。</span>
    </div>

    <div class="ring-wrap">
      <svg class="ring" viewBox="0 0 220 220">
        <circle cx="110" cy="110" :r="RADIUS" class="ring-track" />
        <circle
          cx="110"
          cy="110"
          :r="RADIUS"
          class="ring-fill"
          :stroke-dasharray="CIRC"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 110 110)"
        />
      </svg>
      <div class="ring-center">
        <PetSprite :state="petState" :size="118" />
        <span class="time">{{ mmss }}</span>
      </div>
    </div>

    <p v-if="status === 'done'" class="done-tip">
      入定圆满 — 清气 +1，<b v-if="justGained">已有 {{ qi }} 缕</b>。
    </p>
    <p v-else-if="status === 'running'" class="run-tip muted">小道童正在打坐，轻轻呼吸，别打扰他。</p>
    <p v-else class="run-tip muted">备好了，便开始吧。</p>

    <div class="controls">
      <button v-if="status === 'idle'" class="btn btn-jade lg" @click="start">开始入定</button>
      <template v-else-if="status === 'running'">
        <button class="btn btn-ghost" @click="pause">暂歇</button>
        <button class="btn" @click="reset">结束</button>
      </template>
      <template v-else-if="status === 'paused'">
        <button class="btn btn-jade lg" @click="start">继续</button>
        <button class="btn" @click="reset">结束</button>
      </template>
      <button v-else class="btn btn-jade lg" @click="reset">再来一次</button>
    </div>
  </div>
</template>

<style scoped>
.meditate {
  text-align: center;
}
.center {
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ring-wrap {
  position: relative;
  width: 260px;
  height: 260px;
  margin: 22px auto 8px;
}
.ring {
  width: 100%;
  height: 100%;
}
.ring-track {
  fill: none;
  stroke: rgba(47, 47, 45, 0.07);
  stroke-width: 9;
}
.ring-fill {
  fill: none;
  stroke: var(--qing-yu-deep);
  stroke-width: 9;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s linear;
}
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.time {
  font-family: var(--font-serif);
  font-size: 30px;
  letter-spacing: 0.08em;
  color: var(--mo-hui);
  margin-top: -8px;
}

.done-tip {
  font-size: 15px;
  color: var(--qing-yu-deep);
  margin: 8px 0 0;
}
.done-tip b {
  color: var(--dian-jin);
}
.run-tip {
  margin: 8px 0 0;
  font-size: 13.5px;
}

.controls {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
.lg {
  padding: 11px 30px;
  font-size: 15px;
}
</style>
