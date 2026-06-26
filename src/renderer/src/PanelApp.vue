<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CloudDecor from './components/CloudDecor.vue'
import { useAppStore } from './stores/app'

const router = useRouter()
const store = useAppStore()

const tabs = [
  { to: '/', label: '观舍' },
  { to: '/observe', label: '观时' },
  { to: '/morning', label: '晨课' },
  { to: '/meditate', label: '入定' },
  { to: '/heart', label: '清心' }
]

let unsub: (() => void) | null = null
onMounted(() => {
  void store.load()
  unsub = window.api.on.navigate((route) => {
    void router.push(route)
  })
})
onBeforeUnmount(() => unsub?.())
</script>

<template>
  <div class="shell">
    <CloudDecor />
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">问</span>
        <span class="brand-name">小道童 · 云游记</span>
      </div>
      <nav class="tabs">
        <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab" active-class="tab-on">
          {{ t.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  -webkit-app-region: drag;
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 26px;
  height: 52px;
  padding: 0 22px 0 92px;
  background: rgba(247, 244, 236, 0.86);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--ink-line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #b8453a;
  color: #fff;
  font-family: var(--font-serif);
  font-size: 14px;
}
.brand-name {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.1em;
  color: var(--mo-hui);
  white-space: nowrap;
}

.tabs {
  -webkit-app-region: no-drag;
  display: flex;
  gap: 4px;
}
.tab {
  padding: 6px 14px;
  border-radius: 11px;
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: var(--text-soft);
  transition: all 0.15s ease;
}
.tab:hover {
  color: var(--mo-hui);
  background: rgba(157, 187, 169, 0.16);
}
.tab-on {
  color: var(--mo-hui);
  background: rgba(157, 187, 169, 0.28);
  font-family: var(--font-serif);
}

.content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
}
</style>
