<script setup lang="ts">
import { ref, watch } from "vue";
import { Link, Repeat, MapPin } from "lucide-vue-next";
import { ClonningRequest } from "../services/fluigService";
import type { ClonningData } from "../types/clonning";
import { validateNumeric } from "../utils/validators";

const solicitacaoId = ref("");
const urlSource = ref("");
const userSource = ref("");
const passSource = ref("");

const ResponseTxt = ref<string>("");
const Response = ref<boolean>(false);

const isLoading = ref<boolean>(false);

const handleGenerate = () => {
  var data: ClonningData = {
    solicitacao_id: Number(solicitacaoId.value),
    destination: getUrlBase(),
    url_source: urlSource.value,
    consumer_key: userSource.value,
    consumer_secret: passSource.value,
  };

  ClonningRequest(data)
    .then((response) => {
      Response.value = true;
      ResponseTxt.value = JSON.stringify(response, null, 2);
    })
    .catch((error) => {
      Response.value = true;
      ResponseTxt.value = error.message;
    });
};

function getUrlBase() {
  return window.location.origin;
}

watch([solicitacaoId, urlSource], () => {
  if (!validateNumeric(solicitacaoId.value)) {
    // se não for numero não deixa atualizar o valor
    solicitacaoId.value = solicitacaoId.value.replace(/\D/g, "");
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
      <div class="p-10">
        <div class="space-y-8 animate-in fade-in duration-500">
          <div class="shadow-slate-200/60">
            <!-- formulario de clonagem -->
            <form @submit.prevent="handleGenerate" class="space-y-6">
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
                      required="true"
                      v-model="urlSource"
                      type="text"
                      placeholder="https://source.com"
                      class="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                    />
                  </div>
                </div>

                <!-- <div>
                  <label
                    class="block text-[10px] font-bold text-slate-400 uppercase mb-2"
                    >Consumer Key</label
                  >
                  <div class="relative">
                    <User
                      class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required="true"
                      v-model="userSource"
                      type="text"
                      placeholder="admin"
                      class="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                    />
                  </div>
                </div> -->

                <!-- <div>
                  <label
                    class="block text-[10px] font-bold text-slate-400 uppercase mb-2"
                    >Consumer Secret</label
                  >
                  <div class="relative">
                    <Lock
                      class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required="true"
                      type="text"
                      placeholder="********"
                      v-model="passSource"
                      class="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
                    />
                  </div>
                </div> -->
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

            <!-- resposta gerada -->
            <div
              v-if="Response"
              class="mt-10 pt-10 border-t border-slate-50 space-y-4"
            >
              <label
                class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                >Resposta Gerada</label
              >
              <div class="relative group">
                <div
                  class="w-full p-5 bg-[#F0F5FF] rounded-2xl border border-blue-100 font-mono text-sm text-[#3E5C9A] break-all pr-16 leading-relaxed"
                >
                  {{ ResponseTxt }}
                </div>
              </div>
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
