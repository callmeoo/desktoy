<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import type { PetState } from '@shared/types'
import PetSprite from './components/PetSprite.vue'

const state = ref<PetState>('idle')
const menuOpen = ref(false)

const menu = [
  { label: '观时', hint: '今日时间', route: '/observe' },
  { label: '晨课', hint: '今日修课', route: '/morning' },
  { label: '入定', hint: '专注片刻', route: '/meditate' },
  { label: '清心', hint: '与我说说', route: '/heart' }
]

// ---- 拖拽 / 点击区分 ----
const DRAG_THRESHOLD = 4
let pressing = false
let moved = false
let accX = 0
let accY = 0

function onPointerDown(e: PointerEvent): void {
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
  if (!moved) menuOpen.value = !menuOpen.value
}

function pick(route: string): void {
  menuOpen.value = false
  window.api.nav.open(route)
}

let unsub: (() => void) | null = null
onMounted(() => {
  unsub = window.api.on.petState((s) => {
    state.value = s
  })
})
onBeforeUnmount(() => unsub?.())
</script>

<template>
  <div class="pet-root">
    <!-- 点击空白处收起菜单 -->
    <div v-if="menuOpen" class="backdrop" @pointerdown="menuOpen = false" />

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
      :class="{ floating: state !== 'meditate', dragging: pressing }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
    >
      <PetSprite :state="state" :size="190" />
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
  filter: drop-shadow(0 8px 14px rgba(70, 80, 70, 0.18));
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
  background: rgba(252, 250, 243, 0.96);
  box-shadow: 0 6px 18px rgba(60, 70, 60, 0.16);
  border: 1px solid rgba(157, 187, 169, 0.4);
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
