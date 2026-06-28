<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import type { PetState } from '@shared/types'
import PetSprite from './components/PetSprite.vue'

const state = ref<PetState>('idle')
const menuOpen = ref(false)
// 轻点桌宠时短暂播放的「小动作」状态；为空表示用真实状态
const reaction = ref<PetState | null>(null)
let reactionTimer: ReturnType<typeof setTimeout> | null = null

// 实际展示的形象：小动作优先，否则用主进程推来的真实状态
const displayState = computed<PetState>(() => reaction.value ?? state.value)

const menu = [
  { label: '观时', hint: '今日时间', route: '/observe' },
  { label: '晨课', hint: '今日修课', route: '/morning' },
  { label: '入定', hint: '专注片刻', route: '/meditate' },
  { label: '清心', hint: '与我说说', route: '/heart' }
]

let collapseTimer: ReturnType<typeof setTimeout> | null = null
function setMenuOpen(open: boolean): void {
  if (menuOpen.value === open) return
  menuOpen.value = open
  if (collapseTimer) {
    clearTimeout(collapseTimer)
    collapseTimer = null
  }
  // 菜单展开时把悬浮窗向上撑高，收起时还原——平时只占立绘大小，不挡桌面
  if (open) {
    window.api.pet.setExpanded(true)
  } else {
    // 等退场动画播完再收缩，避免菜单被窗口裁掉
    collapseTimer = setTimeout(() => window.api.pet.setExpanded(false), 200)
  }
}

// ---- 左键：拖拽 / 轻点小动作 ----
const DRAG_THRESHOLD = 4
let pressing = false
let moved = false
let accX = 0
let accY = 0

function onPointerDown(e: PointerEvent): void {
  if (e.button !== 0) return // 只处理左键；右键交给 contextmenu
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
  // 轻点（未拖动）：开心地转一下；不再弹菜单
  if (!moved) playReaction()
}

// 轻点桌宠 → 短暂切到「开心」并做一个晃动，随后回到原状态
function playReaction(): void {
  if (menuOpen.value) return
  reaction.value = 'happy'
  if (reactionTimer) clearTimeout(reactionTimer)
  reactionTimer = setTimeout(() => {
    reaction.value = null
    reactionTimer = null
  }, 1300)
}

// ---- 右键：呼出 / 收起 国风浮层菜单 ----
function onContextMenu(e: MouseEvent): void {
  e.preventDefault()
  setMenuOpen(!menuOpen.value)
}

function pick(route: string): void {
  setMenuOpen(false)
  window.api.nav.open(route)
}

let unsub: (() => void) | null = null
onMounted(() => {
  unsub = window.api.on.petState((s) => {
    state.value = s
  })
})
onBeforeUnmount(() => {
  unsub?.()
  if (reactionTimer) clearTimeout(reactionTimer)
  if (collapseTimer) clearTimeout(collapseTimer)
})
</script>

<template>
  <div class="pet-root" @contextmenu="onContextMenu">
    <!-- 点击空白处收起菜单 -->
    <div v-if="menuOpen" class="backdrop" @pointerdown="setMenuOpen(false)" />

    <transition name="menu">
      <ul v-if="menuOpen" class="menu">
        <li v-for="(item, i) in menu" :key="item.route" :style="{ '--i': i }">
          <button class="menu-item" @click="pick(item.route)">
            <span class="menu-label">{{ item.label }}</span>
            <span class="menu-hint">{{ item.hint }}</span>
          </button>
        </li>
      </ul>
    </transition>

    <div
      class="pet"
      :class="{
        floating: !reaction && displayState !== 'meditate',
        reacting: !!reaction,
        dragging: pressing
      }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
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
/* 轻点时的小动作：开心地晃一晃 */
.pet.reacting {
  animation: wiggle 1.3s ease-in-out;
}
@keyframes wiggle {
  0% {
    transform: translateX(-50%) translateY(0) rotate(0deg);
  }
  18% {
    transform: translateX(-50%) translateY(-10px) rotate(-6deg);
  }
  38% {
    transform: translateX(-50%) translateY(0) rotate(5deg);
  }
  58% {
    transform: translateX(-50%) translateY(-5px) rotate(-3deg);
  }
  78% {
    transform: translateX(-50%) translateY(0) rotate(2deg);
  }
  100% {
    transform: translateX(-50%) translateY(0) rotate(0deg);
  }
}

.menu {
  position: absolute;
  left: 50%;
  bottom: 206px;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
}
/* 逐条飘入，更显飘逸 */
.menu li {
  animation: menu-item-in 0.32s ease both;
  animation-delay: calc(var(--i) * 0.05s);
}
@keyframes menu-item-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
