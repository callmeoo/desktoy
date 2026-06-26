<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { HeartMode, PetState } from '@shared/types'
import PetSprite from '../components/PetSprite.vue'

interface Msg {
  from: 'pet' | 'me'
  text: string
}

const router = useRouter()

const entries: { mode: HeartMode; label: string; hint: string }[] = [
  { mode: 'vent', label: '我想吐槽', hint: '心里堵着，想找人倒一倒' },
  { mode: 'calm', label: '我想冷静', hint: '太乱了，想慢下来喘口气' },
  { mode: 'cheer', label: '我想被鼓励一下', hint: '有点撑不住，想听句暖话' }
]

const mode = ref<HeartMode | null>(null)
const messages = ref<Msg[]>([])
const options = ref<string[]>([])
const step = ref(0)
const done = ref(false)
const input = ref('')
const thread = ref<HTMLElement | null>(null)

const petState = computed<PetState>(() => {
  if (mode.value === 'cheer') return 'happy'
  if (mode.value === 'calm') return 'meditate'
  return 'worried'
})

async function scrollDown(): Promise<void> {
  await nextTick()
  if (thread.value) thread.value.scrollTop = thread.value.scrollHeight
}

async function pick(m: HeartMode): Promise<void> {
  mode.value = m
  messages.value = []
  step.value = 0
  done.value = false
  options.value = []
  const reply = await window.api.heart.reply(m, 0, '')
  messages.value.push({ from: 'pet', text: reply.text })
  options.value = reply.options
  done.value = reply.done
  void scrollDown()
}

async function advance(message: string): Promise<void> {
  if (!mode.value) return
  messages.value.push({ from: 'me', text: message })
  options.value = []
  void scrollDown()
  step.value += 1
  const reply = await window.api.heart.reply(mode.value, step.value, message)
  messages.value.push({ from: 'pet', text: reply.text })
  options.value = reply.options
  done.value = reply.done
  void scrollDown()
}

function send(): void {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  void advance(text)
}

function backToEntry(): void {
  mode.value = null
  messages.value = []
  options.value = []
  done.value = false
  step.value = 0
}
</script>

<template>
  <div class="page heart">
    <!-- 入口 -->
    <template v-if="!mode">
      <div class="page-head center">
        <h1 class="page-title">清心</h1>
        <span class="page-sub">无论何种心情，都可以说给我听。我不评判，只是陪着。</span>
      </div>
      <div class="entries">
        <button v-for="e in entries" :key="e.mode" class="entry" @click="pick(e.mode)">
          <span class="entry-label">{{ e.label }}</span>
          <span class="entry-hint">{{ e.hint }}</span>
        </button>
      </div>
    </template>

    <!-- 对话 -->
    <template v-else>
      <div ref="thread" class="thread">
        <div v-for="(m, i) in messages" :key="i" class="row" :class="m.from">
          <div v-if="m.from === 'pet'" class="avatar"><PetSprite :state="petState" :size="56" /></div>
          <div class="bubble" :class="m.from">{{ m.text }}</div>
        </div>
      </div>

      <div class="dock">
        <div v-if="!done && options.length" class="quick">
          <button v-for="(o, i) in options" :key="i" class="chip" @click="advance(o)">{{ o }}</button>
        </div>

        <div v-if="done" class="end">
          <button class="btn btn-ghost" @click="backToEntry">换一个心情</button>
          <button class="btn" @click="router.push('/')">回观舍</button>
        </div>

        <div v-if="!done" class="composer">
          <input
            v-model="input"
            class="field"
            placeholder="也可以直接打字告诉我……"
            maxlength="200"
            @keyup.enter="send"
          />
          <button class="btn btn-jade" :disabled="!input.trim()" @click="send">说</button>
        </div>
        <button v-if="!done" class="back-link" @click="backToEntry">← 换一个心情</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.heart {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 20px;
}
.center {
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.entries {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 480px;
  margin: 12px auto 0;
  width: 100%;
}
.entry {
  text-align: left;
  padding: 18px 22px;
  border-radius: 16px;
  background: var(--paper-card);
  border: 1px solid var(--ink-line);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition:
    transform 0.12s ease,
    border-color 0.15s ease;
}
.entry:hover {
  transform: translateY(-2px);
  border-color: var(--qing-yu);
}
.entry-label {
  font-family: var(--font-serif);
  font-size: 19px;
  letter-spacing: 0.1em;
  color: var(--mo-hui);
}
.entry-hint {
  font-size: 12.5px;
  color: var(--text-faint);
}

.thread {
  flex: 1;
  overflow-y: auto;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.row.me {
  justify-content: flex-end;
}
.avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(157, 187, 169, 0.16);
  display: grid;
  place-items: center;
  overflow: hidden;
}
.bubble {
  max-width: 70%;
  padding: 11px 15px;
  border-radius: 14px;
  font-size: 14.5px;
  line-height: 1.7;
}
.bubble.pet {
  background: var(--paper-card);
  border: 1px solid var(--ink-line);
  border-bottom-left-radius: 4px;
  color: var(--mo-hui);
}
.bubble.me {
  background: var(--qing-yu-deep);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.dock {
  flex-shrink: 0;
  padding-top: 12px;
}
.quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.chip {
  padding: 7px 14px;
  border-radius: 14px;
  font-size: 13.5px;
  background: rgba(157, 187, 169, 0.16);
  border: 1px solid var(--qing-yu);
  color: var(--qing-yu-deep);
  transition: background 0.15s ease;
}
.chip:hover {
  background: rgba(157, 187, 169, 0.3);
}
.composer {
  display: flex;
  gap: 10px;
}
.composer .field {
  flex: 1;
}
.back-link {
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--text-faint);
}
.back-link:hover {
  color: var(--text-soft);
}
.end {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
