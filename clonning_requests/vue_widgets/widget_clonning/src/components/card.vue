<script lang="ts" setup>
import { Trash2, Type } from "lucide-vue-next";

const emit = defineEmits<{
  (e: "remove", id: string): void;
}>();

const props = defineProps<{
  name: string;
  id: string;
}>();
</script>

<template>
  <div
    class="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 transition-all"
  >
    <div class="flex items-center gap-4">
      <div class="p-3 bg-blue-100 rounded-xl text-blue-600">
        <Type class="w-5 h-5" />
      </div>
      <div>
        <p class="font-bold text-[#002D72] text-sm">{{ props.name }}</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <button
        @click="emit('remove', props.id)"
        class="p-2 text-slate-300 hover:text-red-500 transition-colors"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<style scoped></style>
