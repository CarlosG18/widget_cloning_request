<script setup>
import { Check, Database, AlertTriangle, Copy } from "lucide-vue-next";
import { ref } from "vue";
import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";

const requirements = [
  "O dataset <strong class='text-slate-800 font-bold'>dsGetParamsClone</strong> deve estar disponível no servidor onde será puxado a solicitação.",
  "A widget deve ter sido exportada para o servidor onde irá receber a solicitação clonada.",
  "O processo ao qual o usuário irá clonar deve estar disponível no servidor onde será iniciado o processo de clonagem e liberar a versão.",
  "O serviço do fluig API deve ser cadastrado no servidor de origem e com o nome do serviço igual a <strong class='text-slate-800 font-bold'>Fluig API</strong>",
  "O endpoint do fluigHub <strong class='text-slate-800 font-bold'>'/datasearchauth'</strong> deve estar disponível no servidor de produção.",
];

const comments = [
  "Caso o usuario tenha marcado a opção de capturar anexos, o widget irá realizar o upload dos anexos no GED, na pasta -> Formulários Fluig/<processId>/<processInstance>/.",
];

const datasetFields = [
  { type: "string", name: "processInstanceId" },
  { type: "state", name: "targetState" },
  { type: "user", name: "targetAssignee" },
  { type: "data", name: "formFields" },
  { type: "id", name: "processId" },
  { type: "data", name: "anexos" },
];

const copyStatus = ref("Copiar");

const envVariables = `VITE_CONSUMER_KEY_<NOME DO SERVIDOR>=***\nVITE_CONSUMER_SECRET_<NOME DO SERVIDOR>=***\nVITE_ACCESS_TOKEN_<NOME DO SERVIDOR>=***\nVITE_TOKEN_SECRET_<NOME DO SERVIDOR>=***\nVITE_SERVER_<NOME DO SERVIDOR>_URL=***`;

async function copyEnvExample() {
  try {
    await navigator.clipboard.writeText(envVariables);
    copyStatus.value = "Copiado";
    setTimeout(() => {
      copyStatus.value = "Copiar";
    }, 1200);
    toast.success("Copiado para a área de transferência");
  } catch (error) {
    console.error("Não foi possível copiar para o clipboard:", error);
    toast.error("Não foi possível copiar para a área de transferência");
  }
}
</script>

<template>
  <div class="w-full p-8 flex flex-col justify-center font-sans">
    <!-- como informar os dados para a autenticação oauth -->
    <div class="flex items-center gap-3 mb-8 ml-2">
      <div class="w-1.5 h-8 bg-[#002d5e] rounded-full"></div>
      <h2 class="text-xl font-bold text-[#002d5e]">Como usar o widget</h2>
    </div>

    <!-- elemento de selecao de servidor -->
    <div
      class="w-full h-full flex flex-col bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm mb-8"
    >
      <p class="text-slate-700 text-sm mb-8 leading-relaxed">
        Os botões de escolha do servidores são preenchidos automaticamente a
        partir das variavies cadastradas no arquivo .env
      </p>

      <div class="relative bg-[#001a3d] rounded-2xl p-8 mb-8 group">
        <button
          type="button"
          @click="copyEnvExample"
          class="absolute top-4 right-4 p-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
        >
          <Toaster
            richColors
            :closeButton="true"
            closeButtonPosition="bottom-right"
            position="top-center"
          />
          <Copy class="w-4 h-4 text-white" />
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
        class="bg-[#f0f5ff] border-l-4 border-[#002d5e] rounded-xl p-5 flex items-center gap-4 mb-8"
      >
        <div class="text-[#002d5e] flex-shrink-0">
          <AlertTriangle class="w-4 h-4" />
        </div>
        <p class="text-slate-700 text-sm font-medium">
          portanto, para utilizar o widget, você precisa ter as variáveis de
          ambiente definidas.
        </p>
      </div>

      <!-- alguns comentários -->
      <div
        class="w-full bg-white rounded-3xl border border-blue-100 p-8 shadow-sm h-full flex flex-col mb-8"
      >
        <div class="flex items-center gap-3 mb-8">
          <div class="text-blue-900">
            <Check class="w-4 h-4" />
          </div>
          <h2 class="text-xl font-bold text-slate-800">
            Detalhes importantes para o uso do widget:
          </h2>
        </div>

        <ul class="space-y-6">
          <li v-for="(item, index) in comments" :key="index" class="flex gap-4">
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

      <!-- elemento de lista de requisitos -->
      <div
        class="w-full bg-white rounded-3xl border border-blue-100 p-8 shadow-sm h-full flex flex-col"
      >
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
    </div>

    <!-- elemento de descricao do dataset -->
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
  background-color: #001a3d !important;
  color: #f0f5ff !important;
  border-color: #001a3d !important;
}

.two-column-layout {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 1rem !important;
}
</style>
