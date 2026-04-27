<script setup>
import { Check, Database } from "lucide-vue-next";

const requirements = [
  "O dataset <strong class='text-slate-800 font-bold'>dsGetParamsClone</strong> deve estar disponível no servidor onde será puxado a solicitação.",
  "A widget deve ter sido exportada para o servidor onde irá receber a solicitação clonada.",
  "O processo ao qual o usuário irá clonar deve estar disponível no servidor onde será iniciado o processo de clonagem e liberar a versão.",
  "O serviço do fluig API deve ser cadastrado no servidor de origem e com o nome do serviço igual a <strong class='text-slate-800 font-bold'>Fluig API</strong>",
  "O endpoint do fluigHub <strong class='text-slate-800 font-bold'>'/datasearchauth'</strong> deve estar disponível no servidor de produção.",
];

const datasetFields = [
  { type: "string", name: "processInstanceId" },
  { type: "state", name: "targetState" },
  { type: "user", name: "targetAssignee" },
  { type: "data", name: "formFields" },
  { type: "id", name: "processId" },
];
</script>

<template>
  <div class="p-8 flex flex-col justify-center font-sans">
    <!-- como informar os dados para a autenticação oauth -->
    <div class="flex items-center gap-3 mb-8 ml-2">
      <div class="w-1.5 h-8 bg-[#002d5e] rounded-full"></div>
      <h2 class="text-2xl font-bold text-[#002d5e]">Como usar o widget</h2>
    </div>

    <div
      class="max-w-4xl bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm mb-8"
    >
      <p class="text-slate-700 text-sm mb-8 leading-relaxed">
        Os botões de escolha do servidores são preenchidos automaticamente a
        partir das variavies cadastradas no arquivo .env
      </p>

      <div class="relative bg-[#001a3d] rounded-2xl p-8 mb-8 group">
        <button
          class="absolute top-4 right-4 p-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>

        <code class="block font-mono text-sm text-slate-300 leading-loose">
          <span class="block"
            >VITE_CONSUMER_KEY_&lt;NOME DO SERVIDOR&gt;=***</span
          >
          <span class="block"
            >VITE_CONSUMER_SECRET_&lt;NOME DO SERVIDOR&gt;=***</span
          >
          <span class="block"
            >VITE_ACCESS_TOKEN_&lt;NOME DO SERVIDOR&gt;=***</span
          >
          <span class="block"
            >VITE_TOKEN_SECRET_&lt;NOME DO SERVIDOR&gt;=***</span
          >
          <span class="block"
            >VITE_SERVER_&lt;NOME DO SERVIDOR&gt;_URL=***</span
          >
        </code>
      </div>

      <div
        class="bg-[#f0f5ff] border-l-4 border-[#002d5e] rounded-xl p-5 flex items-center gap-4"
      >
        <div class="text-[#002d5e] flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"
            />
          </svg>
        </div>
        <p class="text-slate-700 text-sm font-medium">
          portanto, para utilizar o widget, você precisa ter as variáveis de
          ambiente definidas.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-blue-100 p-8 shadow-sm mb-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="text-blue-900">
          <Check class="w-4 h-4" />
        </div>
        <h2 class="text-xl font-bold text-slate-800">
          Para funcionar corretamente:
        </h2>
      </div>

      <ul class="space-y-6">
        <li
          v-for="(item, index) in requirements"
          :key="index"
          class="flex gap-4"
        >
          <div
            class="flex-shrink-0 w-8 h-8 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center font-bold text-sm"
          >
            {{ index + 1 }}
          </div>
          <p class="text-slate-600 leading-relaxed text-sm">
            <span v-html="item"></span>
          </p>
        </li>
      </ul>
    </div>

    <div
      class="bg-[#f0f5ff] rounded-3xl border border-blue-100 p-8 shadow-sm flex-1"
    >
      <div class="flex items-center gap-3 mb-6">
        <div class="text-[#1e3a8a]">
          <Database class="w-4 h-4" />
        </div>
        <h2 class="text-xl font-bold text-slate-800">
          O que faz o dsGetParamsClone?
        </h2>
      </div>

      <p class="text-slate-600 text-sm mb-8 leading-relaxed">
        Este dataset é responsável por obter os parâmetros necessários para
        iniciar um processo de clonagem usando o endpoint
        <strong class="text-slate-800">start process</strong> do fluigHub. Os
        dados obtidos pelo dataset são os seguintes:
      </p>

      <div class="space-y-3">
        <div
          v-for="field in datasetFields"
          :key="field.name"
          class="bg-white rounded-xl p-3 flex items-center gap-4 shadow-sm border border-blue-50"
        >
          <span
            class="bg-blue-50 text-blue-800 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider min-w-[60px] text-center"
          >
            {{ field.type }}
          </span>
          <span class="text-slate-700 font-medium text-sm">{{
            field.name
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
code {
  font-family: "JetBrains Mono", "Fira Code", "Courier New", monospace;
}
</style>
