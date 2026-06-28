<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { PetState } from '@shared/types'
import PetSprite from './components/PetSprite.vue'

const state = ref<PetState>('idle')
const reaction = ref<PetState | null>(null)
const displayState = computed<PetState>(() => reaction.value ?? state.value)

const menuOpen = ref(false)
const greeting = ref<string | null>(null)

const menu = [
  { label: '观时', hint: '今日时间', route: '/observe' },
  { label: '晨课', hint: '今日修课', route: '/morning' },
  { label: '入定', hint: '专注片刻', route: '/meditate' },
  { label: '清心', hint: '与我说说', route: '/heart' }
]

// 摸摸头 → 道门问候（轻点不直接给任务，先打招呼）
const GREETINGS = [
  '道友安好，今日可还顺心？',
  '无量天尊～道友来啦。',
  '且坐且歇，清风自来。',
  '道友辛苦了，喝口清茶可好？',
  '心若清静，处处皆道场。',
  '摸摸头～今日也要好好的。',
  '有事右键轻唤，贫道随时在。'
]
let greetIndex = -1
let greetTimer: ReturnType<typeof setTimeout> | null = null
let reactTimer: ReturnType<typeof setTimeout> | null = null

function sayGreeting(text: string, hold = 3400): void {
  greeting.value = text
  if (greetTimer) clearTimeout(greetTimer)
  greetTimer = setTimeout(() => (greeting.value = null), hold)
}

function patPet(): void {
  greetIndex = (greetIndex + 1) % GREETINGS.length
  sayGreeting(GREETINGS[greetIndex])
  reaction.value = 'happy'
  if (reactTimer) clearTimeout(reactTimer)
  reactTimer = setTimeout(() => (reaction.value = null), 2200)
}

// 左键：拖拽 / 摸头；右键：唤出功课菜单
const DRAG_THRESHOLD = 4
let pressing = false
let moved = false
let accX = 0
let accY = 0

function onPointerDown(e: PointerEvent): void {
  if (e.button !== 0) return // 只有左键参与拖拽/摸头
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  pressing = true
  moved = false
  accX = 0
  accY = 0
}

function onPointerMove(e: PointerEvent): void {
  if (!pressing) return
  accX += e.movementX
  accY += e.movementY
  if (!moved && Math.hypot(accX, accY) > DRAG_THRESHOLD) moved = true
  if (moved) window.api.pet.move(e.movementX, e.movementY)
}

function onPointerUp(e: PointerEvent): void {
  if (!pressing) return
  pressing = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  if (moved) return
  if (menuOpen.value) menuOpen.value = false
  else patPet()
}

function onContextMenu(e: MouseEvent): void {
  e.preventDefault()
  greeting.value = null
  menuOpen.value = !menuOpen.value
}

function pick(route: string): void {
  menuOpen.value = false
  window.api.nav.open(route)
}

// 右键菜单展开时撑高悬浮窗（底边不动），给菜单留出立绘上方空间；收起则还原
watch(menuOpen, (open) => window.api.pet.setExpanded(open))

let unsub: (() => void) | null = null
onMounted(() => {
  unsub = window.api.on.petState((s) => (state.value = s))
  // 首次现身：先问候，并轻轻提示交互方式
  setTimeout(() => sayGreeting('道友，今日安好。轻点摸摸头，右键可唤功课。', 5200), 900)
})
onBeforeUnmount(() => {
  unsub?.()
  if (greetTimer) clearTimeout(greetTimer)
  if (reactTimer) clearTimeout(reactTimer)
})
</script>

<template>
  <div class="pet-root">
    <!-- 点击空白处收起菜单 -->
    <div
      v-if="menuOpen"
      class="backdrop"
      @pointerdown="menuOpen = false"
      @contextmenu.prevent="menuOpen = false"
    />

    <!-- 摸头问候气泡 -->
    <transition name="bubble">
      <div v-if="greeting" class="greeting">{{ greeting }}</div>
    </transition>

    <!-- 右键功课菜单 -->
    <transition name="menu">
      <ul v-if="menuOpen" class="menu">
        <li v-for="item in menu" :key="item.route">
          <button class="menu-item" @click="pick(item.route)">
            <span class="menu-label">{{ item.label }}</span>
            <span class="menu-hint">{{ item.hint }}</span>
          </button>
        </li>
      </ul>
    </transition>

    <div
      class="pet"
      :class="{ floating: displayState !== 'meditate', dragging: pressing }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @contextmenu="onContextMenu"
    >
      <PetSprite :state="displayState" :size="190" />
    </div>
  </div>
</template>

<style scoped>
.pet-root {
  position: relative;
  width: 100%;
  height: 100%;
}

.backdrop {
  position: fixed;
  inset: 0;
}

.pet {
  position: absolute;
  left: 50%;
  bottom: 4px;
  transform: translateX(-50%);
  cursor: grab;
  filter: drop-shadow(0 8px 14px rgba(86, 107, 94, 0.18));
  -webkit-app-region: no-drag;
}
.pet.dragging {
  cursor: grabbing;
}
.pet.floating {
  animation: float 4.2s ease-in-out infinite;
}
@keyframes float {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-6px);
  }
}

/* 问候气泡 */
.greeting {
  position: absolute;
  left: 50%;
  bottom: 198px;
  transform: translateX(-50%);
  max-width: 210px;
  padding: 9px 14px;
  border-radius: 14px;
  background: rgba(253, 252, 246, 0.97);
  border: 1px solid rgba(116, 143, 124, 0.45);
  box-shadow: 0 8px 20px rgba(86, 107, 94, 0.16);
  font-family: var(--font-serif);
  font-size: 14px;
  line-height: 1.65;
  letter-spacing: 0.03em;
  color: var(--mo-hui);
  text-align: center;
  z-index: 3;
}
.greeting::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -6px;
  width: 12px;
  height: 12px;
  transform: translateX(-50%) rotate(45deg);
  background: rgba(253, 252, 246, 0.97);
  border-right: 1px solid rgba(116, 143, 124, 0.45);
  border-bottom: 1px solid rgba(116, 143, 124, 0.45);
}
.bubble-enter-active,
.bubble-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

/* 右键菜单 */
.menu {
  position: absolute;
  left: 50%;
  bottom: 188px;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7px;
  z-index: 2;
}
.menu-item {
  width: 116px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 13px;
  border-radius: 16px;
  background: rgba(253, 252, 246, 0.96);
  box-shadow: 0 6px 18px rgba(86, 107, 94, 0.16);
  border: 1px solid rgba(116, 143, 124, 0.38);
  transition:
    transform 0.12s ease,
    background 0.12s ease;
}
.menu-item:hover {
  transform: translateX(2px);
  background: #fff;
}
.menu-label {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.12em;
  color: var(--mo-hui);
}
.menu-hint {
  font-size: 10px;
  color: var(--text-faint);
}

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
