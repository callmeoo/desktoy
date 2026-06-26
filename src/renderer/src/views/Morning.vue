<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import PetSprite from '../components/PetSprite.vue'
import { useAppStore } from '../stores/app'

const router = useRouter()
const store = useAppStore()
const { morning } = storeToRefs(store)

const editing = ref(false)
const mainTask = ref('')
const todos = ref<string[]>(['', '', ''])

const canSave = computed(
  () => mainTask.value.trim().length > 0 || todos.value.some((t) => t.trim().length > 0)
)
// 已有计划且未在编辑 → 展示；否则展示表单
const showForm = computed(() => !morning.value || editing.value)

function startEdit(): void {
  mainTask.value = morning.value?.mainTask ?? ''
  const existing = morning.value?.todos.map((t) => t.text) ?? []
  todos.value = [existing[0] ?? '', existing[1] ?? '', existing[2] ?? '']
  editing.value = true
}

async function save(): Promise<void> {
  if (!canSave.value) return
  await store.saveMorning(mainTask.value, todos.value)
  editing.value = false
}
</script>

<template>
  <div class="page">
    <!-- 表单 -->
    <template v-if="showForm">
      <section class="card greet">
        <PetSprite state="idle" :size="120" />
        <div>
          <h1 class="greet-title">早安，今日想先修哪一课？</h1>
          <p class="greet-sub">不必贪多。立一条主线，再选三件必做，足矣。</p>
        </div>
      </section>

      <section class="card">
        <label class="lbl">今日主线</label>
        <input
          v-model="mainTask"
          class="field"
          placeholder="例如：把方案初稿写完"
          maxlength="60"
          @keyup.enter="save"
        />

        <label class="lbl mt">三件必做</label>
        <div class="todo-inputs">
          <div v-for="n in todos.length" :key="n" class="todo-input">
            <span class="idx">{{ n }}</span>
            <input
              v-model="todos[n - 1]"
              class="field"
              :placeholder="`第 ${n} 件`"
              maxlength="40"
              @keyup.enter="save"
            />
          </div>
        </div>

        <div class="actions">
          <button v-if="morning" class="btn btn-ghost" @click="editing = false">取消</button>
          <button class="btn btn-jade" :disabled="!canSave" @click="save">落定今日之课</button>
        </div>
      </section>
    </template>

    <!-- 展示已立之课 -->
    <template v-else>
      <div class="page-head">
        <h1 class="page-title">今日修课</h1>
        <span class="page-sub">立于晨，行于日，无需求全。</span>
      </div>

      <section class="card">
        <p class="main-task">
          <span class="main-task-label">主线</span>
          {{ morning!.mainTask || '今日未立主线，随心而行。' }}
        </p>
        <ul class="todos">
          <li v-for="(t, i) in morning!.todos" :key="i">
            <button class="todo" :class="{ done: t.done }" @click="store.toggleTodo(i)">
              <span class="todo-dot" />
              <span class="todo-text">{{ t.text }}</span>
            </button>
          </li>
          <li v-if="morning!.todos.length === 0" class="muted">今日未列必做之事。</li>
        </ul>
        <div class="actions">
          <button class="btn btn-ghost" @click="startEdit">重新晨课</button>
          <button class="btn" @click="router.push('/')">回观舍</button>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.greet {
  display: flex;
  align-items: center;
  gap: 18px;
}
.greet-title {
  font-family: var(--font-serif);
  font-size: 23px;
  letter-spacing: 0.08em;
  margin: 0 0 8px;
  color: var(--mo-hui);
}
.greet-sub {
  margin: 0;
  color: var(--text-soft);
  font-size: 13.5px;
}

.lbl {
  display: block;
  font-size: 13px;
  color: var(--qing-yu-deep);
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}
.lbl.mt {
  margin-top: 20px;
}
.todo-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.todo-input {
  display: flex;
  align-items: center;
  gap: 10px;
}
.idx {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(157, 187, 169, 0.22);
  color: var(--qing-yu-deep);
  font-size: 12px;
  font-family: var(--font-serif);
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.main-task {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  margin: 0 0 16px;
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
</style>
