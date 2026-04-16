<script lang="ts" setup>
import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";

const props = defineProps<{
  res: any;
  isRes: boolean;
}>();

toast.error("Event has not been created");
</script>

<template>
  <div
    v-if="isRes"
    class="mt-4 p-4 rounded-2xl shadow bg-white border border-slate-200"
  >
    <div class="flex items-center gap-3 mb-4">
      <div
        class="w-10 h-10 flex items-center justify-center rounded-full"
        :class="res.success ? 'bg-green-100' : 'bg-red-100'"
      >
        <span
          class="text-xl"
          :class="res.success ? 'text-green-600' : 'text-red-600'"
        >
          {{ res.success ? "✔" : "✖" }}
        </span>
      </div>

      <p
        class="text-lg font-semibold"
        :class="res.success ? 'text-green-600' : 'text-red-600'"
      >
        {{
          res.success ? "Clonagem realizada com sucesso" : "Erro na clonagem"
        }}
      </p>
    </div>

    <div v-if="res.success" class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-gray-400">ID da nova solicitação</p>
        <p class="font-medium">
          {{ res.newId ? res.newId : "sem informação" }}
        </p>
      </div>

      <div>
        <p class="text-gray-400">ProcessId</p>
        <p class="font-medium">
          {{ res.processId ? res.processId : "sem informação" }}
        </p>
      </div>

      <div>
        <p class="text-gray-400">Data da clonagem</p>
        <p class="font-medium">
          {{ new Date(res.date).toLocaleString() }}
        </p>
      </div>

      <div>
        <p class="text-gray-400">Resultado</p>
        <span
          class="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700"
        >
          {{ res.success ? "Sucesso" : "Erro" }}
        </span>
      </div>
    </div>
    <div v-else class="text-sm">
      <Toaster />
      {{ res.error }}
    </div>
  </div>
</template>

<style scoped></style>
