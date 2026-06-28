<script setup lang="ts">
import { computed } from 'vue'
import type { PetState } from '@shared/types'

const props = withDefaults(defineProps<{ state?: PetState; size?: number }>(), {
  state: 'idle',
  size: 180
})

const eyesOpen = computed(() => ['idle', 'focus', 'worried'].includes(props.state))
const eyesContent = computed(() => props.state === 'happy' || props.state === 'meditate')
const handsTogether = computed(() => props.state === 'meditate')

// 真实立绘：把图片(建议透明背景 PNG/GIF)放进 src/renderer/src/assets/pet/。
// 文件名既可直接用状态名(idle.png…)，也可用带描述的名字(01_idle_meditate.png…)，
// 由下面的关键词自动匹配。放了就替换占位 SVG；缺失状态回退到 idle，再没有才用 SVG。
const petImages = import.meta.glob(
  '../assets/pet/*.{png,PNG,gif,GIF,webp,WEBP,jpg,JPG,jpeg,JPEG}',
  { eager: true, import: 'default' }
) as Record<string, string>

const petFiles = Object.keys(petImages).map((path) => ({
  name: (path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '').toLowerCase(),
  url: petImages[path]
}))

// 每个状态的匹配关键词（中英文皆可，文件名包含即命中，按优先级）
const STATE_KEYWORDS: Record<PetState, string[]> = {
  idle: ['idle', 'stand', 'default', '待机', '打坐'],
  meditate: ['meditate', 'zen', '入定', '打坐', '待机'],
  happy: ['happy', 'spin', 'smile', 'joy', '开心', '转圈'],
  focus: ['focus', 'work', 'concentrate', '专注', '陪伴', '工作'],
  tired: ['sleepy', 'yawn', 'tired', '困倦', '哈欠'],
  worried: ['comfort', 'worried', 'worry', 'sad', 'sooth', '安慰', '担心']
}

function resolveImage(state: PetState): string | null {
  const exact = petFiles.find((f) => f.name === state)
  if (exact) return exact.url
  for (const kw of STATE_KEYWORDS[state]) {
    const hit = petFiles.find((f) => f.name.includes(kw))
    if (hit) return hit.url
  }
  return null
}

const imageByState = {} as Record<PetState, string | null>
;(Object.keys(STATE_KEYWORDS) as PetState[]).forEach((s) => {
  imageByState[s] = resolveImage(s)
})

const spriteUrl = computed<string | null>(
  () => imageByState[props.state] ?? imageByState.idle ?? null
)
</script>

<template>
  <img
    v-if="spriteUrl"
    class="pet-art"
    :src="spriteUrl"
    :width="size"
    :height="size"
    alt="小道童"
    draggable="false"
  />
  <svg v-else :width="size" :height="size" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ds-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#bcd6c6" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#bcd6c6" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- 入定光晕 -->
    <circle v-if="state === 'meditate'" cx="100" cy="96" r="86" fill="url(#ds-glow)" />

    <!-- 祥云 -->
    <g opacity="0.95">
      <ellipse cx="100" cy="196" rx="62" ry="18" fill="#e9efe9" />
      <ellipse cx="66" cy="192" rx="22" ry="13" fill="#eef3ee" />
      <ellipse cx="134" cy="192" rx="22" ry="13" fill="#eef3ee" />
      <path
        d="M48 196 q6 -10 18 -8 q4 -12 18 -8 M152 196 q-6 -10 -18 -8 q-4 -12 -18 -8"
        fill="none"
        stroke="#cdd8cf"
        stroke-opacity="0.6"
        stroke-width="1.4"
      />
    </g>

    <!-- 袍身 -->
    <path
      d="M100 104 C 80 104 72 120 66 150 C 60 178 54 196 62 201 C 82 209 118 209 138 201 C 146 196 140 178 134 150 C 128 120 120 104 100 104 Z"
      fill="#f7f4ec"
      stroke="#d8d2c2"
      stroke-width="1.6"
    />
    <!-- 衣襟 -->
    <path d="M100 106 L92 150 L100 160 L108 150 Z" fill="#eef0e6" stroke="#d8d2c2" stroke-width="1" />

    <!-- 青玉腰带 -->
    <path d="M72 148 Q100 158 128 148 L130 160 Q100 170 70 160 Z" fill="#9dbba9" />
    <circle cx="100" cy="156" r="4.5" fill="#7fa68f" />
    <path d="M100 160 q-3 12 -1 20 M100 160 q3 12 1 20" stroke="#7fa68f" stroke-width="2" fill="none" />

    <!-- 双手 / 衣袖 -->
    <g v-if="handsTogether">
      <ellipse cx="100" cy="176" rx="20" ry="12" fill="#f1ede2" stroke="#d8d2c2" stroke-width="1.2" />
      <circle cx="100" cy="174" r="8" fill="#cfe0d4" stroke="#9dbba9" stroke-width="1.2" />
    </g>
    <g v-else>
      <ellipse cx="64" cy="156" rx="13" ry="18" fill="#f1ede2" stroke="#d8d2c2" stroke-width="1.4" transform="rotate(-12 64 156)" />
      <ellipse cx="136" cy="156" rx="13" ry="18" fill="#f1ede2" stroke="#d8d2c2" stroke-width="1.4" transform="rotate(12 136 156)" />
    </g>

    <!-- 脖子 -->
    <rect x="93" y="98" width="14" height="14" rx="6" fill="#f2d7c2" />

    <!-- 头发后层 -->
    <ellipse cx="100" cy="80" rx="38" ry="36" fill="#2f2f2d" />
    <!-- 脸 -->
    <circle cx="100" cy="78" r="32" fill="#f6dcc8" />
    <!-- 刘海 / 发际 -->
    <path
      d="M68 78 C 66 46 134 46 132 78 C 126 60 118 52 100 52 C 82 52 74 60 68 78 Z"
      fill="#2f2f2d"
    />
    <path d="M68 80 q-6 14 -2 26 M132 80 q6 14 2 26" stroke="#2f2f2d" stroke-width="6" stroke-linecap="round" fill="none" />

    <!-- 发髻 -->
    <ellipse cx="100" cy="34" rx="19" ry="15" fill="#2f2f2d" />
    <ellipse cx="94" cy="31" rx="6" ry="4" fill="#454541" />
    <!-- 玉花 + 金簪 -->
    <line x1="112" y1="40" x2="126" y2="32" stroke="#c8a24e" stroke-width="2.4" stroke-linecap="round" />
    <circle cx="126" cy="31" r="3" fill="#c8a24e" />
    <g>
      <circle cx="86" cy="34" r="6.5" fill="#9dbba9" />
      <circle cx="86" cy="34" r="2.6" fill="#c8a24e" />
    </g>

    <!-- 面部 -->
    <!-- 睁眼 -->
    <g v-if="eyesOpen">
      <ellipse cx="89" cy="80" rx="4.4" ry="6" fill="#2f2f2d" />
      <ellipse cx="111" cy="80" rx="4.4" ry="6" fill="#2f2f2d" />
      <circle cx="90.6" cy="78" r="1.4" fill="#fff" />
      <circle cx="112.6" cy="78" r="1.4" fill="#fff" />
    </g>
    <!-- 含笑眯眼 -->
    <g v-else-if="eyesContent" stroke="#2f2f2d" stroke-width="2.6" fill="none" stroke-linecap="round">
      <path d="M83 81 q6 -5 12 0" />
      <path d="M105 81 q6 -5 12 0" />
    </g>
    <!-- 困倦闭眼 -->
    <g v-else stroke="#2f2f2d" stroke-width="2.6" fill="none" stroke-linecap="round">
      <path d="M83 81 q6 4 12 0" />
      <path d="M105 81 q6 4 12 0" />
    </g>

    <!-- 担心眉 -->
    <g v-if="state === 'worried'" stroke="#2f2f2d" stroke-width="2" stroke-linecap="round">
      <path d="M82 69 l10 3" />
      <path d="M118 69 l-10 3" />
    </g>

    <!-- 腮红 -->
    <g v-if="state === 'happy' || state === 'idle'" fill="#e9a98f" opacity="0.5">
      <ellipse cx="80" cy="90" rx="5" ry="3" />
      <ellipse cx="120" cy="90" rx="5" ry="3" />
    </g>

    <!-- 嘴 -->
    <path v-if="state === 'happy'" d="M90 92 q10 11 20 0 q-10 5 -20 0 Z" fill="#c66a55" />
    <ellipse v-else-if="state === 'tired'" cx="100" cy="95" rx="4" ry="5.5" fill="#c66a55" />
    <path v-else-if="state === 'worried'" d="M92 97 q8 -4 16 0" stroke="#b06a58" stroke-width="2" fill="none" stroke-linecap="round" />
    <path v-else d="M92 93 q8 5 16 0" stroke="#b06a58" stroke-width="2" fill="none" stroke-linecap="round" />

    <!-- 梦蝶（待机 / 开心） -->
    <g v-if="state === 'idle' || state === 'happy'" transform="translate(150 36)" opacity="0.9">
      <path d="M0 0 C -10 -8 -16 -2 -10 6 C -6 10 -2 6 0 0 Z" fill="#bcd6c6" stroke="#9dbba9" stroke-width="0.8" />
      <path d="M0 0 C 10 -8 16 -2 10 6 C 6 10 2 6 0 0 Z" fill="#cfe0d4" stroke="#9dbba9" stroke-width="0.8" />
      <line x1="0" y1="-4" x2="0" y2="6" stroke="#7fa68f" stroke-width="1.2" />
    </g>

    <!-- 开心闪光 -->
    <g v-if="state === 'happy'" fill="#c8a24e">
      <path d="M40 60 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" />
      <path d="M158 92 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 Z" />
    </g>

    <!-- 困倦 Zzz -->
    <g v-if="state === 'tired'" fill="#9a9a8c" font-family="serif" font-style="italic">
      <text x="138" y="44" font-size="12">z</text>
      <text x="148" y="34" font-size="15">z</text>
      <text x="160" y="22" font-size="18">z</text>
    </g>

    <!-- 担心 汗滴 -->
    <path v-if="state === 'worried'" d="M132 66 q4 6 0 9 q-4 -3 0 -9 Z" fill="#a9c6d6" opacity="0.85" />

    <!-- 专注 灵珠 -->
    <circle v-if="state === 'focus'" cx="150" cy="150" r="11" fill="#cfe0d4" stroke="#9dbba9" stroke-width="1.4" />
    <circle v-if="state === 'focus'" cx="146" cy="146" r="3" fill="#ffffff" opacity="0.7" />
  </svg>
</template>

<style scoped>
.pet-art {
  display: block;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
