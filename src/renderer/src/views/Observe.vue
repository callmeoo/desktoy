<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DayStats } from '@shared/types'
import { categoryMeta } from '@shared/categories'
import { formatClock, formatDuration, formatPercent } from '../utils/format'

const stats = ref<DayStats | null>(null)
const loading = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

async function refresh(): Promise<void> {
  stats.value = await window.api.observe.getToday()
  loading.value = false
}

const hasData = computed(() => (stats.value?.totalMs ?? 0) > 0)

onMounted(() => {
  void refresh()
  timer = setInterval(refresh, 15_000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1 class="page-title">观时</h1>
      <span class="page-sub">观照今日，时间都去了哪里 — 不评判，只是看见。</span>
    </div>

    <div v-if="stats?.needsPermission" class="perm card">
      <b>需要「辅助功能」权限</b>
      <p>
        小道童读不到前台窗口标题。请在「系统设置 → 隐私与安全性 → 辅助功能」中，
        允许本应用（开发时为终端 / Electron），随后观时即可生效。
      </p>
    </div>

    <section class="card">
      <div class="summary">
        <div class="summary-main">
          <span class="summary-num">{{ formatDuration(stats?.totalMs ?? 0) }}</span>
          <span class="summary-label">今日已观照</span>
        </div>
        <div class="summary-meta">
          <span v-if="stats?.since" class="muted">自 {{ formatClock(stats.since) }} 起</span>
          <button class="btn btn-ghost" @click="refresh">刷新</button>
        </div>
      </div>

      <div v-if="hasData" class="bars">
        <div v-for="c in stats!.categories" :key="c.id" class="bar-row">
          <div class="bar-head">
            <span class="bar-name">
              <span class="dot" :style="{ background: categoryMeta(c.id).color }" />
              {{ categoryMeta(c.id).label }}
            </span>
            <span class="bar-val">{{ formatDuration(c.durationMs) }} · {{ formatPercent(c.ratio) }}</span>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ width: formatPercent(c.ratio), background: categoryMeta(c.id).color }"
            />
          </div>
        </div>
      </div>
      <p v-else-if="loading" class="muted empty">正在观照……</p>
      <p v-else class="muted empty">刚开始记录，过一会儿再来看吧。每 10 秒，我都在悄悄留意。</p>
    </section>

    <section v-if="stats && stats.topApps.length" class="card">
      <h2 class="card-title">停留较久的去处</h2>
      <ul class="apps">
        <li v-for="a in stats.topApps" :key="a.app" class="app-row">
          <span class="app-cat" :style="{ background: categoryMeta(a.category).color }">
            {{ categoryMeta(a.category).label }}
          </span>
          <span class="app-name">{{ a.app }}</span>
          <span class="app-dur muted">{{ formatDuration(a.durationMs) }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.perm {
  border-color: var(--dian-jin);
  background: #fbf3e2;
  margin-bottom: 16px;
}
.perm b {
  color: #a9772a;
}
.perm p {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--text-soft);
  line-height: 1.7;
}

.summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 18px;
}
.summary-main {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.summary-num {
  font-family: var(--font-serif);
  font-size: 30px;
  color: var(--mo-hui);
}
.summary-label {
  font-size: 13px;
  color: var(--text-faint);
}
.summary-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.bar-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13.5px;
}
.bar-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--mo-hui);
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.bar-val {
  color: var(--text-soft);
  font-size: 12.5px;
}
.bar-track {
  height: 10px;
  border-radius: 6px;
  background: rgba(47, 47, 45, 0.06);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s ease;
}
.empty {
  padding: 8px 0;
}

.apps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.app-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--ink-line);
  font-size: 14px;
}
.app-row:last-child {
  border-bottom: none;
}
.app-cat {
  flex-shrink: 0;
  font-size: 11px;
  color: #fff;
  padding: 2px 8px;
  border-radius: 6px;
}
.app-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.app-dur {
  flex-shrink: 0;
  font-size: 13px;
}
</style>
