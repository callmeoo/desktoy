<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import PetSprite from '../components/PetSprite.vue'
import { useAppStore } from '../stores/app'
import { categoryMeta } from '@shared/categories'
import { formatDuration, formatPercent } from '../utils/format'

const router = useRouter()
const store = useAppStore()
const { qi, morning, today } = storeToRefs(store)

const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour >= 5 && hour < 11) return { hi: '早安', line: '晨光熹微，新的一天，慢慢来。' }
  if (hour >= 11 && hour < 17) return { hi: '午安', line: '午后小憩，记得起身喝口水。' }
  if (hour >= 17 && hour < 22) return { hi: '晚安', line: '暮色四合，今日已经辛苦了。' }
  return { hi: '夜深了', line: '宜早些安歇，明日清气自足。' }
})

const topCategory = computed(() => today.value?.categories?.[0] ?? null)

const entries = [
  { to: '/observe', label: '观时', hint: '看看今日的时间去了哪' },
  { to: '/morning', label: '晨课', hint: '立下今日要修的课' },
  { to: '/meditate', label: '入定', hint: '专注片刻，攒一缕清气' },
  { to: '/heart', label: '清心', hint: '心里有事，与我说说' }
]

onMounted(() => {
  void store.refreshToday()
})
</script>

<template>
  <div class="page">
    <section class="hero card">
      <div class="hero-text">
        <h1 class="hero-hi">{{ greeting.hi }}</h1>
        <p class="hero-line">{{ greeting.line }}</p>
        <p class="hero-qi">今日清气 · <b>{{ qi }}</b> 缕</p>
      </div>
      <div class="hero-pet">
        <PetSprite state="happy" :size="150" />
      </div>
    </section>

    <section class="card">
      <h2 class="card-title">今日修课</h2>
      <template v-if="morning">
        <p class="main-task">
          <span class="main-task-label">主线</span>
          {{ morning.mainTask || '今日未立主线，随心而行。' }}
        </p>
        <ul class="todos">
          <li v-for="(t, i) in morning.todos" :key="i">
            <button class="todo" :class="{ done: t.done }" @click="store.toggleTodo(i)">
              <span class="todo-dot" />
              <span class="todo-text">{{ t.text }}</span>
            </button>
          </li>
          <li v-if="morning.todos.length === 0" class="muted todo-empty">今日未列必做之事。</li>
        </ul>
      </template>
      <template v-else>
        <p class="muted">今日尚未晨课。</p>
        <button class="btn btn-jade" @click="router.push('/morning')">去立今日之课</button>
      </template>
    </section>

    <section class="card observe-mini" @click="router.push('/observe')">
      <h2 class="card-title">观时一瞥</h2>
      <template v-if="topCategory">
        <p class="mini-line">
          今日多在
          <b :style="{ color: categoryMeta(topCategory.id).color }">
            {{ categoryMeta(topCategory.id).label }}
          </b>
          ，约 {{ formatDuration(topCategory.durationMs) }}（{{ formatPercent(topCategory.ratio) }}）
        </p>
        <p class="muted small">点此查看今日完整观时 →</p>
      </template>
      <template v-else>
        <p class="muted">刚开始观察，稍候片刻再来看吧。</p>
      </template>
    </section>

    <section class="entries">
      <button v-for="e in entries" :key="e.to" class="entry" @click="router.push(e.to)">
        <span class="entry-label">{{ e.label }}</span>
        <span class="entry-hint">{{ e.hint }}</span>
      </button>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  overflow: hidden;
}
.hero-hi {
  font-family: var(--font-serif);
  font-size: 30px;
  letter-spacing: 0.14em;
  margin: 0 0 8px;
  color: var(--mo-hui);
}
.hero-line {
  color: var(--text-soft);
  margin: 0 0 14px;
}
.hero-qi {
  margin: 0;
  font-size: 14px;
  color: var(--text-soft);
}
.hero-qi b {
  color: var(--dian-jin);
  font-size: 18px;
  font-family: var(--font-serif);
}
.hero-pet {
  flex-shrink: 0;
}

.main-task {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  margin: 0 0 14px;
  color: var(--mo-hui);
}
.main-task-label {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--qing-yu-deep);
  border: 1px solid var(--qing-yu);
  border-radius: 6px;
  padding: 2px 7px;
}
.todos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.todo {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  text-align: left;
  padding: 8px 4px;
  font-size: 15px;
}
.todo-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.6px solid var(--qing-yu-deep);
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.todo.done .todo-dot {
  background: var(--qing-yu-deep);
  box-shadow: inset 0 0 0 3px var(--paper-card);
}
.todo.done .todo-text {
  color: var(--text-faint);
  text-decoration: line-through;
}
.todo-empty {
  font-size: 14px;
  padding: 6px 4px;
}

.observe-mini {
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.observe-mini:hover {
  border-color: var(--qing-yu);
}
.mini-line {
  margin: 0 0 6px;
  font-size: 15px;
}
.small {
  font-size: 12px;
}

.entries {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.entry {
  text-align: left;
  padding: 16px 18px;
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
  letter-spacing: 0.12em;
  color: var(--mo-hui);
}
.entry-hint {
  font-size: 12.5px;
  color: var(--text-faint);
}
</style>
