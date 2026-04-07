<script setup lang="ts">
import { ref, watch } from "vue";
import { Link, User, Lock, Repeat, MapPin, Eye, EyeOff } from "lucide-vue-next";
import { ClonningRequest } from "../services/basic/applicationBasic";
import type { ClonningData } from "../services/basic/applicationBasic";
import { validateNumeric } from "../utils/validators";

const solicitacaoId = ref("");
const urlDestino = ref("");
const userDestino = ref("");
const passDestino = ref("");
const type_pass = ref<boolean>(false);

const ResponseTxt = ref<string>("");

const Response = ref<boolean>(false);

const handleGenerate = () => {
  var data: ClonningData = {
    solicitacao_id: Number(solicitacaoId.value),
    url_origem: getUrlBase(),
    url_destino: urlDestino.value,
    user_destino: userDestino.value,
    pass_destino: passDestino.value,
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

watch([solicitacaoId, urlDestino], () => {
  if (!validateNumeric(solicitacaoId.value)) {
    // se não for numero não deixa atualizar o valor
    solicitacaoId.value = solicitacaoId.value.replace(/\D/g, "");
  }
});
</script>

<template>
  <div
    class="bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans"
  >
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-[#002D72] mb-2">Clonning Request</h1>
      <p class="text-slate-500">Clone solicitações entre servidores.</p>
    </div>

    <div
      class="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 p-12 border border-slate-100"
    >
      <form @submit.prevent="handleGenerate" class="space-y-6">
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
          <div class="flex items-center gap-2 text-[#002D72] font-bold mb-4">
            <MapPin class="w-4 h-4" />
            <span>Destino</span>
          </div>

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
                v-model="urlDestino"
                type="text"
                placeholder="https://destino.com"
                class="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-[10px] font-bold text-slate-400 uppercase mb-2"
              >Usuário</label
            >
            <div class="relative">
              <User
                class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required="true"
                v-model="userDestino"
                type="text"
                placeholder="admin"
                class="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-[10px] font-bold text-slate-400 uppercase mb-2"
              >Senha</label
            >
            <div class="relative">
              <Lock
                class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required="true"
                v-model="passDestino"
                placeholder="*********"
                :type="type_pass ? 'text' : 'password'"
                class="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-600"
              />
              <!-- visualização do pass -->
              <div
                @click="type_pass = !type_pass"
                class="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <EyeOff v-if="type_pass" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-[#003087] hover:bg-[#00266b] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] mt-8"
        >
          <Repeat class="w-4 h-4 text-slate-400" />
          clonar solicitação
        </button>
      </form>

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
            <!-- apresentar mais detalhes do retorno -->
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
</style>
