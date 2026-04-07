<script setup lang="ts">
import { ref, watch } from "vue";
import {
  Link,
  User,
  Lock,
  Repeat,
  MapPin,
  Eye,
  EyeOff,
  LayoutGrid,
  Plus,
  Settings,
} from "lucide-vue-next";
import { ClonningRequest } from "../services/basic/applicationBasic";
import type { ClonningData } from "../services/basic/applicationBasic";
import { validateNumeric } from "../utils/validators";
import Card from "../components/card.vue";

interface CardItem {
  component: any;
  props: {
    name: string;
    id: string; // Ex: ID da solicitação conforme o log
  };
}

const solicitacaoId = ref("");
const urlDestino = ref("");
const userDestino = ref("");
const passDestino = ref("");
const type_pass = ref<boolean>(false);

const ResponseTxt = ref<string>("");
const Response = ref<boolean>(false);

const activeTab = ref("clone"); // Aba padrão

const arrayCards = ref<CardItem[]>([]);
const newCardName = ref<string>("");

const handleGenerate = () => {
  var data: ClonningData = {
    solicitacao_id: Number(solicitacaoId.value),
    url_origem: getUrlBase(),
    url_destino: urlDestino.value,
    user_destino: userDestino.value,
    pass_destino: passDestino.value,
  };

  // campos de validação
  var fields: any = [];
  arrayCards.value.forEach((card) => {
    fields.push(card.props.name);
  });

  ClonningRequest(data, fields)
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

function addCard(name: string) {
  arrayCards.value.push({
    component: Card,
    props: {
      name: name,
      id: `request_${Date.now()}`, // Exemplo de ID dinâmico
    },
  });
}

function removeCard(id: string) {
  arrayCards.value = arrayCards.value.filter((card) => card.props.id !== id);
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
          @click="activeTab = 'clone'"
          :class="[
            activeTab === 'clone'
              ? 'bg-white shadow-sm text-[#003087]'
              : 'text-slate-400 hover:text-slate-600',
          ]"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
        >
          <LayoutGrid class="w-4 h-4" />
          Clonar
        </button>
        <button
          @click="activeTab = 'config'"
          :class="[
            activeTab === 'config'
              ? 'bg-white shadow-sm text-[#003087]'
              : 'text-slate-400 hover:text-slate-600',
          ]"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
        >
          <Settings class="w-4 h-4" />
          Configurações
        </button>
      </div>
      <div class="p-10">
        <!-- aba de clonagem -->
        <div
          v-if="activeTab === 'clone'"
          class="space-y-8 animate-in fade-in duration-500"
        >
          <div class="shadow-slate-200/60">
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
                <div
                  class="flex items-center gap-2 text-[#002D72] font-bold mb-4"
                >
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

        <!-- aba de config -->
        <div
          v-if="activeTab === 'config'"
          class="space-y-8 animate-in fade-in duration-500"
        >
          <div class="text-center">
            <h2 class="text-lg font-bold text-[#002D72]">Adicionar campos</h2>
            <p class="text-slate-500 text-sm mt-1">
              Gerencie dinamicamente os campos que possuem valores únicos para
              evitar registros duplicados.
            </p>
          </div>

          <div class="flex gap-3">
            <input
              v-model="newCardName"
              type="text"
              placeholder="Nome do Campo (ex: ID da Solicitação)"
              class="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
            />
            <button
              class="bg-[#002D72] hover:bg-[#001D4A] text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
              @click="addCard(newCardName)"
            >
              <Plus class="w-4 h-4" /> Adicionar
            </button>
          </div>

          <div class="space-y-4">
            <div v-for="card in arrayCards" :key="card.props.id">
              <Card
                :name="card.props.name"
                :id="card.props.id"
                @remove="removeCard"
              />
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
