<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import {
  Link,
  Repeat,
  MapPin,
  FileInput,
  Workflow,
  Settings,
  HelpCircle,
  Save,
} from "lucide-vue-next";
import { ClonningRequest, ClonningFormsInt } from "../services/fluigService";
import type { ClonningData, Response, FormsIntData } from "../types/clonning";
import { validateNumeric } from "../utils/validators";
import CardFeedBack from "../components/CardFeedBack.vue";
import Help from "../components/Help.vue";

import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";
import { Spinner } from "@/components/ui/spinner";

// Solicitação
const solicitacaoId = ref("");
const urlSource = ref("");

// Forms Int
const isDevFormsInt = ref<boolean>(true);
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

function humanizeServerLabel(suffix: string): string {
  return suffix
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

function getServerOptionsFromEnv() {
  const consumerKeys = Object.keys(import.meta.env).filter((key) =>
    key.startsWith("VITE_CONSUMER_KEY_"),
  );

  return consumerKeys
    .map((key) => {
      const suffix = key.replace("VITE_CONSUMER_KEY_", "");
      return {
        id: suffix,
        label: humanizeServerLabel(suffix),
        url: import.meta.env[`VITE_SERVER_${suffix}_URL`],
      };
    })
    .filter((option) => option.url); // Apenas incluir se tiver URL definida
}

const serverOptions = getServerOptionsFromEnv();

const selectedServer = ref<string>(serverOptions[0]?.id || "");
const selectedServerUrl = ref<string>(serverOptions[0]?.url || "");

const isLoading = ref<boolean>(false);

const selectServer = (server: { id: string; label: string; url: string }) => {
  selectedServer.value = server.id;
  selectedServerUrl.value = server.url;
};

const cloneRequest = () => {
  const effectiveUrlSource = selectedServerUrl.value || urlSource.value;

  var data: ClonningData = {
    solicitacao_id: Number(solicitacaoId.value),
    destination: getUrlBase(),
    url_source: effectiveUrlSource,
    servidor: selectedServer.value,
  };

  isURLValid.value = validateURL(effectiveUrlSource);
  if (!isURLValid.value) return;

  isLoading.value = true;
  ClonningRequest(data)
    .then((response) => {
      res.success = response.success;
      res.newId = response.newId;
      res.processId = response.processId;
      res.date = response.date;
      res.error = response.error;
      // feedback com toast
      if (response.success) {
        isResSolicitacao.value = true;
        toast.success("Solicitação clonada com sucesso");
      }

      if (response.error) {
        isResSolicitacao.value = false;
        toast.error(`Erro na solicitação: ${response.error}`);
      }
    })
    .catch((error) => {
      res.error = error.message;
      isResSolicitacao.value = false;
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const cloneFormsInt = () => {
  var data: FormsIntData = {
    documentId: Number(documentId.value),
    destination: getUrlBase(),
    url_source: urlSourceDocument.value,
  };

  isLoading.value = true;
  ClonningFormsInt(data)
    .then((response) => {
      res.success = response.success;
      res.newId = response.newId;
      res.processId = response.processId;
      res.date = response.date;
      res.error = response.error;
      isResFormsInt.value = true;

      // feedback com toast
      if (response.success) {
        toast.success("Solicitação clonada com sucesso");
      }

      if (response.error) {
        toast.error(`Erro na solicitação: ${response.error}`);
      }
    })
    .catch((error) => {
      res.error = error.message;
      isResFormsInt.value = false;
    })
    .finally(() => {
      isLoading.value = false;
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

watch([solicitacaoId, documentId, isResSolicitacao], () => {
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
      <h1 class="text-3xl font-bold text-[#002D72] mb-2">Cloning Request</h1>
      <p class="text-slate-500">
        Gerencie e clone solicitações entre servidores.
      </p>
    </div>

    <div
      class="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-1 shadow-slate-200/60 border border-slate-100"
    >
      <!-- abas -->
      <div
        class="flex p-2 gap-2 bg-slate-50 rounded-[32px] border-b border-slate-100"
      >
        <!-- Aba da Clonagem -->
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

        <!-- Aba do Forms interno -->
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

        <!-- Aba de Configurações -->
        <!--          
        <button
          @click="activeTab = 'settings'"
          :class="[
            activeTab === 'settings'
              ? 'bg-white shadow-sm text-[#003087]'
              : 'text-slate-400 hover:text-slate-600',
          ]"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
        >
          <Settings class="w-4 h-4" />
          Configurações
        </button> -->

        <!-- Aba de Ajuda -->
        <button
          @click="activeTab = 'help'"
          :class="[
            activeTab === 'help'
              ? 'bg-white shadow-sm text-[#003087]'
              : 'text-slate-400 hover:text-slate-600',
          ]"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
        >
          <HelpCircle class="w-4 h-4" />
          Ajuda
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

                  <!-- div para botões de seleção de servidor -->
                  <div class="space-y-3 mb-4">
                    <div class="flex flex-wrap gap-3">
                      <button
                        v-for="server in serverOptions"
                        :key="server.id"
                        type="button"
                        @click="selectServer(server)"
                        :class="[
                          selectedServer === server.id
                            ? 'bg-[#003087] text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                          'rounded-2xl px-4 py-3 text-sm font-semibold transition-all',
                        ]"
                      >
                        {{ server.label }}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  :disabled="isLoading"
                  type="submit"
                  class="w-full bg-[#003087] hover:bg-[#00266b] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] mt-8"
                >
                  <Repeat class="w-4 h-4 text-slate-400" v-if="!isLoading" />
                  <Spinner v-if="isLoading" />
                  {{ isLoading ? "Clonando..." : "Clonar solicitação" }}
                </button>
              </form>

              <!-- Feedback -->
              <Toaster
                richColors
                :closeButton="true"
                closeButtonPosition="top-right"
              />
              <CardFeedBack v-if="isResSolicitacao" :res="res" />
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
              <div
                v-if="isDevFormsInt"
                class="rounded-[32px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center"
              >
                <div
                  class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-200 text-slate-600"
                >
                  <span class="text-2xl">🚧</span>
                </div>
                <h2 class="text-xl font-bold text-slate-800 mb-2">
                  Em desenvolvimento
                </h2>
                <p class="text-sm leading-6 text-slate-500 max-w-xl mx-auto">
                  A funcionalidade de clonagem de Forms Interno ainda está sendo
                  preparada. Em breve você poderá utilizar esse recurso para
                  clonar documentos entre servidores.
                </p>
              </div>
              <form v-else @submit.prevent="cloneFormsInt" class="space-y-6">
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

              <Toaster
                richColors
                :closeButton="true"
                closeButtonPosition="top-right"
              />

              <CardFeedBack v-if="isResFormsInt" :res="res" />
            </div>
          </div>
        </div>
      </div>

      <!-- conteúdo configurações -->
      <div
        v-if="activeTab === 'settings'"
        class="space-y-8 animate-in fade-in duration-500"
      >
        <div class="p-10">
          <div class="space-y-8 animate-in fade-in duration-500">
            <div class="shadow-slate-200/60">
              <!-- formulario de clonagem -->
              <form @submit.prevent="cloneRequest" class="space-y-6">
                <!-- header -->
                <div
                  class="flex items-center gap-2 text-[#002D72] font-bold mb-4"
                >
                  <Settings class="w-4 h-4" />
                  <span>Configurações de Clonagem</span>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                    >
                      CONSUMER_KEY
                    </label>
                    <input
                      required="true"
                      v-model="solicitacaoId"
                      type="text"
                      placeholder="Ex: 2941"
                      class="w-full pl-5 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                    >
                      CONSUMER_SECRET
                    </label>
                    <input
                      required="true"
                      v-model="solicitacaoId"
                      type="text"
                      placeholder="Ex: 2941"
                      class="w-full pl-5 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                    >
                      ACCESS_TOKEN
                    </label>
                    <input
                      required="true"
                      v-model="solicitacaoId"
                      type="text"
                      placeholder="Ex: 2941"
                      class="w-full pl-5 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                    >
                      TOKEN_SECRET
                    </label>
                    <input
                      required="true"
                      v-model="solicitacaoId"
                      type="text"
                      placeholder="Ex: 2941"
                      class="w-full pl-5 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                    />
                  </div>
                </div>

                <div class="w-full">
                  <label
                    class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                  >
                    SERVER URL
                  </label>
                  <input
                    required="true"
                    v-model="solicitacaoId"
                    type="text"
                    placeholder="Ex: 2941"
                    class="w-full pl-5 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                  />
                </div>

                <!-- botão para salvar os dados -->
                <button
                  :disabled="isLoading"
                  type="submit"
                  class="w-full bg-[#003087] hover:bg-[#00266b] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] mt-8"
                >
                  <Save class="w-4 h-4 text-slate-400" v-if="!isLoading" />
                  <Spinner v-if="isLoading" />
                  {{ isLoading ? "Salvando..." : "Salvar dados" }}
                </button>
              </form>

              <!-- Feedback -->
              <Toaster
                richColors
                :closeButton="true"
                closeButtonPosition="top-right"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- conteúdo ajuda -->
      <div
        v-if="activeTab === 'help'"
        class="space-y-8 animate-in fade-in duration-500"
      >
        <Help />
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
