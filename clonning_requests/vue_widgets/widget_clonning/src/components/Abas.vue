<script setup lang="ts">
const props = defineProps({
  activeTab: String,
  title: String,
});
</script>

<template>
  <button
    @click="activeTab = 'solicitacao'"
    :class="[
      activeTab === 'solicitacao'
        ? 'bg-white shadow-sm text-[#003087]'
        : 'text-slate-400 hover:text-slate-600',
    ]"
    class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
  >
    <Workflow class="w-4 h-4" />
    {{ title }}
  </button>
</template>

<style scoped></style>
