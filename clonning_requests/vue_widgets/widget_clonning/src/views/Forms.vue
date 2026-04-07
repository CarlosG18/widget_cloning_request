<script setup lang="ts">
import { ref, onMounted } from "vue";
// import { Link } from "lucide-vue-next";
import { ClonningRequest } from "../services/oauth/applicationOauth";
import type { ClonningRequestData } from "../services/oauth/applicationOauth";

const solicitacaoId = ref("");
const urlOrigem = ref("");
const urlDestino = ref("");

const ResponseTxt = ref<string>("");

const Response = ref<boolean>(false);

const handleGenerate = () => {
  const data: ClonningRequestData = {
    solicitacao_id: Number(solicitacaoId.value),
    url_origem: urlOrigem.value,
    url_destino: urlDestino.value,
    oauth_origem: {
      consumerKey: "clonning_requests",
      consumerSecret:
        "DhKj2rXdoc+gR/zOFQfsoMWNILr4+tSg+gtL0NdwIHRtxTVTJRGksEXSbExgYvY/",
      accessToken: "eb5e4c26-a67e-44ed-bbba-9e1907face47",
      tokenSecret:
        "dafdb4ac-ace5-4457-8d3e-9de9e01f75b3ce724df1-2d43-4922-9299-e3b957800e60",
    },
    oauth_destino: {
      consumerKey: "clonning_requests",
      consumerSecret:
        "DhKj2rXdoc+gR/zOFQfsoMWNILr4+tSg+gtL0NdwIHRtxTVTJRGksEXSbExgYvY/",
      accessToken: "eb5e4c26-a67e-44ed-bbba-9e1907face47",
      tokenSecret:
        "dafdb4ac-ace5-4457-8d3e-9de9e01f75b3ce724df1-2d43-4922-9299-e3b957800e60",
    },
  };

  ClonningRequest(data)
    .then((response) => {
      Response.value = true;
      ResponseTxt.value = JSON.stringify(response, null, 2);
    })
    .catch((error) => {
      Response.value = true;
      console.error(error);
      ResponseTxt.value = error.message;
    });
};

function getUrlBase() {
  return window.location.origin;
}

onMounted(() => {
  urlOrigem.value = getUrlBase();
});
/*
function generateCredentials(consumerKey: string, consumerSecret: string) {
  var oauthService = fluigAPI.getOAuthUserService();

  // Gera as chaves para o usuário específico
  // Substitua "MINHA_CONSUMER_KEY" e "login_usuario" pelos valores reais
  var oauthVO = oauthService.generateUserOAuthKeys(consumerKey, consumerSecret);

  // Recupera os tokens gerados
  var accessToken = oauthVO.getTokenAccess();
  [3];
  var tokenSecret = oauthVO.getTokenSecret();
  [3];

  return {
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    accessToken: accessToken,
    tokenSecret: tokenSecret,
  };
}*/
</script>

<template>
  <div
    class="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans"
  >
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-[#002D72] mb-2">
        Novo Redirecionamento
      </h1>
      <p class="text-slate-500">
        Configure as rotas de tráfego entre ambientes.
      </p>
    </div>

    <div
      class="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 p-12 border border-slate-100"
    >
      <form @submit.prevent="handleGenerate" class="space-y-8">
        <div class="max-w-xs">
          <label
            class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
          >
            Solicitação ID
          </label>
          <input
            type="text"
            placeholder="Ex: REQ-2941"
            class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 text-slate-600"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div class="space-y-6">
            <div class="flex items-center gap-2 text-[#002D72] font-bold mb-4">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>Origem</span>
            </div>

            <div class="space-y-4">
              <div
                v-for="field in ['URL', 'CONSUMER KEY', 'LOGIN']"
                :key="field"
              >
                <label
                  class="block text-[10px] font-bold text-slate-400 uppercase mb-2"
                  >{{ field }}</label
                >
                <div class="relative">
                  <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  >
                  </span>
                  <input
                    type="text"
                    class="w-full pl-12 pr-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 text-slate-600 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div
              class="flex items-center gap-2 text-emerald-700 font-bold mb-4"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Destino</span>
            </div>

            <div class="space-y-4">
              <div
                v-for="field in ['URL', 'CONSUMER KEY', 'LOGIN']"
                :key="field"
              >
                <label
                  class="block text-[10px] font-bold text-slate-400 uppercase mb-2"
                  >{{ field }}</label
                >
                <div class="relative">
                  <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  >
                  </span>
                  <input
                    type="text"
                    class="w-full pl-12 pr-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 text-slate-600 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-[#003087] hover:bg-[#00266b] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99]"
        >
          <span class="bg-white/20 rounded-full p-1"
            ><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          Gerar Redirecionamento
        </button>
      </form>

      <div class="mt-10 pt-10 border-t border-slate-50 space-y-4">
        <label
          class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest"
          >Resposta Gerada</label
        >
        <div class="relative group">
          <div
            class="w-full p-5 bg-[#F0F5FF] rounded-2xl border border-blue-100 font-mono text-sm text-[#3E5C9A] break-all pr-16"
          >
            https://hub.redirect.io/v1/route?id=REQ-2941&origin=origem.com&target=destino.com
          </div>
          <button
            class="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg border border-blue-100 text-blue-600 shadow-sm hover:bg-blue-50 transition-all"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
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
