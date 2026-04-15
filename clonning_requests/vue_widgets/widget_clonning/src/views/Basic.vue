<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { Link, Repeat, MapPin, FileInput, Workflow } from "lucide-vue-next";
import { ClonningRequest, ClonningFormsInt } from "../services/fluigService";
import type { ClonningData, Response, FormsIntData } from "../types/clonning";
import { validateNumeric } from "../utils/validators";
import CardFeedBack from "../components/CardFeedBack.vue";

// Solicitação
const solicitacaoId = ref("");
const urlSource = ref("");

// Forms Int
const documentId = ref("");
const urlSourceDocument = ref("");

const activeTab = ref("solicitacao"); // Aba padrão

const isResSolicitacao = ref<boolean>(false);
const isResFormsInt = ref<boolean>(false);
const res = reactive<Response>({
  success: false,
  newId: "",
  processId: "",
  date: "",
  error: "",
});

const isURLValid = ref<boolean>(true);

const isLoading = ref<boolean>(false);

const cloneRequest = () => {
  var data: ClonningData = {
    solicitacao_id: Number(solicitacaoId.value),
    destination: getUrlBase(),
    url_source: urlSource.value,
  };

  isURLValid.value = validateURL(urlSource.value);
  if (!isURLValid.value) return;

  ClonningRequest(data)
    .then((response) => {
      console.log("response: ", response);
      res.success = response.success;
      res.newId = response.newId;
      res.processId = response.processId;
      res.date = response.date;
      res.error = response.error;
      isResSolicitacao.value = true;
    })
    .catch((error) => {
      console.log("response: ", error);
      res.error = error.message;
      isResSolicitacao.value = false;
    });
};

const cloneFormsInt = () => {
  var data: FormsIntData = {
    documentId: Number(documentId.value),
    destination: getUrlBase(),
    url_source: urlSourceDocument.value,
  };

  ClonningFormsInt(data)
    .then((response) => {
      console.log("response: ", response);
      res.success = response.success;
      res.newId = response.newId;
      res.processId = response.processId;
      res.date = response.date;
      res.error = response.error;
      isResFormsInt.value = true;
    })
    .catch((error) => {
      console.log("response: ", error);
      res.error = error.message;
      isResFormsInt.value = false;
    });
};

function getUrlBase() {
  return window.location.origin;
}

function validateURL(url: string): boolean {
  if (!url) return true;

  const pattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?" +
      "(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_/]*)?$",
    "i",
  );

  return pattern.test(url);
}

watch([solicitacaoId, documentId], () => {
  if (!validateNumeric(solicitacaoId.value)) {
    // se não for numero não deixa atualizar o valor
    solicitacaoId.value = solicitacaoId.value.replace(/\D/g, "");
    documentId.value = documentId.value.replace(/\D/g, "");
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-6 font-sans"
  >
    <!-- cabeçalho -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-[#002D72] mb-2">Clonning Request</h1>
      <p class="text-slate-500">
        Gerencie e clone solicitações entre servidores.
      </p>
    </div>

    <div
      class="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-1 shadow-slate-200/60 border border-slate-100"
    >
      <!-- abas -->
      <div
        class="flex p-2 gap-2 bg-slate-50 rounded-t-[32px] border-b border-slate-100"
      >
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
          Solicitação
        </button>
        <button
          @click="activeTab = 'formsInt'"
          :class="[
            activeTab === 'formsInt'
              ? 'bg-white shadow-sm text-[#003087]'
              : 'text-slate-400 hover:text-slate-600',
          ]"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
        >
          <FileInput class="w-4 h-4" />
          Forms Interno
        </button>
      </div>

      <!-- conteúdo solicitação -->
      <div
        v-if="activeTab === 'solicitacao'"
        class="space-y-8 animate-in fade-in duration-500"
      >
        <div class="p-10">
          <div class="space-y-8 animate-in fade-in duration-500">
            <div class="shadow-slate-200/60">
              <!-- formulario de clonagem -->
              <form @submit.prevent="cloneRequest" class="space-y-6">
                <!-- campo de solicitação id -->
                <div class="w-full">
                  <label
                    class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                  >
                    Solicitação ID
                  </label>
                  <input
                    required="true"
                    v-model="solicitacaoId"
                    type="text"
                    placeholder="Ex: 2941"
                    class="w-full pl-5 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                  />
                </div>

                <div class="space-y-4">
                  <div
                    class="flex items-center gap-2 text-[#002D72] font-bold mb-4"
                  >
                    <MapPin class="w-4 h-4" />
                    <span>Servidor de Produção da Solicitação</span>
                  </div>

                  <!-- campo de url de destino -->
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-400 uppercase mb-2"
                      >URL</label
                    >
                    <div class="relative">
                      <Link
                        class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        :input="validateURL(urlSource)"
                        required="true"
                        v-model="urlSource"
                        type="text"
                        placeholder="https://source.com"
                        :class="
                          isURLValid ? 'border-slate-200' : 'border-red-500'
                        "
                        class="w-full pl-12 pr-5 py-3.5 bg-white border rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                      />
                    </div>
                    <div v-if="!isURLValid">
                      <p class="text-sm mt-2 text-red-700">
                        URL inválida ou inacessível
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  :disabled="isLoading"
                  type="submit"
                  class="w-full bg-[#003087] hover:bg-[#00266b] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] mt-8"
                >
                  <Repeat class="w-4 h-4 text-slate-400" />
                  clonar solicitação
                </button>
              </form>

              <!-- Feedback -->
              <CardFeedBack :res="res" :isRes="isResSolicitacao" />
            </div>
          </div>
        </div>
      </div>

      <!-- conteúdo forms interno -->
      <div
        v-if="activeTab === 'formsInt'"
        class="space-y-8 animate-in fade-in duration-500"
      >
        <div class="p-10">
          <div class="space-y-8 animate-in fade-in duration-500">
            <div class="shadow-slate-200/60">
              <!-- formulario de clonagem -->
              <form @submit.prevent="cloneFormsInt" class="space-y-6">
                <!-- campo de solicitação id -->
                <div class="w-full">
                  <label
                    class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                  >
                    Document ID
                  </label>
                  <input
                    required="true"
                    v-model="documentId"
                    type="text"
                    placeholder="Ex: 2941"
                    class="w-full pl-5 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                  />
                </div>

                <div class="space-y-4">
                  <div
                    class="flex items-center gap-2 text-[#002D72] font-bold mb-4"
                  >
                    <MapPin class="w-4 h-4" />
                    <span>Servidor de Produção da Solicitação</span>
                  </div>

                  <!-- campo de url de destino -->
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-400 uppercase mb-2"
                      >URL</label
                    >
                    <div class="relative">
                      <Link
                        class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        required="true"
                        :input="validateURL(urlSource)"
                        v-model="urlSourceDocument"
                        type="text"
                        placeholder="https://source.com"
                        class="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <button
                  :disabled="isLoading"
                  type="submit"
                  class="w-full bg-[#003087] hover:bg-[#00266b] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] mt-8"
                >
                  <Repeat class="w-4 h-4 text-slate-400" />
                  Clonar Forms interno
                </button>
              </form>

              <!-- Feedback -->
              <CardFeedBack :res="res" :isRes="isResFormsInt" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Adiciona suavidade na renderização de fontes */
.font-sans {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.animate-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
