<script setup lang="ts"></script>

<template>
  <svg class="cloud-decor" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="none" stroke="#9dbba9" stroke-opacity="0.18" stroke-width="2">
      <path d="M40 150 q30 -40 70 -30 q10 -34 50 -24 q24 -30 60 -8" />
      <path d="M400 60 q30 -30 64 -18 q18 -22 48 -6 q26 -16 44 6" />
      <path d="M120 40 q20 -22 46 -12 q14 -16 36 -2" />
    </g>
  </svg>
</template>

<style scoped>
.cloud-decor {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.8;
}
</style>
