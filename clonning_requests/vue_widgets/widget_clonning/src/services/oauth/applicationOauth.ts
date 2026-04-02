import { FluigService } from "./fluigOauth";
import { ExternalService } from "./externalServiceOauth";
import type { OAuthCredentials } from "../../utils/oauthInterceptor";

export interface ClonningRequestData {
  solicitacao_id: number;
  url_origem: string;
  url_destino: string;
  oauth_origem: OAuthCredentials;
  oauth_destino: OAuthCredentials;
}

export async function ClonningRequest(data: ClonningRequestData) {
  try {
    const {
      solicitacao_id,
      url_origem,
      url_destino,
      oauth_origem,
      oauth_destino,
    } = data;

    validateNumeric(solicitacao_id, "solicitacao_id");
    validateUrl(url_origem);
    validateUrl(url_destino);

    // ---------------------------oauthInterceptor
    // FLUIG ORIGEM
    // ---------------------------
    // Não precisamos mais do .login() explicitamente! O interceptor cuida disso.
    const fluig = new FluigService(oauth_origem, url_origem);

    const fluigData = await fluig.getRequest(solicitacao_id);
    const fluigParams = await fluig.getParameters(String(solicitacao_id));
    const processId = fluigData?.processId;

    if (!processId) throw new Error("processId não encontrado");

    // ---------------------------
    // EXTRAÇÃO targetState
    // ---------------------------
    let targetState: number;
    try {
      const msgStr = fluigParams?.message || "{}";
      const msgJson = typeof msgStr === "string" ? JSON.parse(msgStr) : msgStr;
      targetState = msgJson?.values?.[0]?.targetState;
      if (!targetState) throw new Error("targetState não encontrado");
    } catch (error) {
      throw new Error("Erro ao interpretar parâmetros do processo");
    }

    const formFields =
      typeof fluigData?.formFields === "object" ? fluigData.formFields : {};
    const now = new Date();

    const payload = {
      targetState,
      targetAssignee: "admin", // Certifique-se de que este usuário existe no destino
      form_fields: formFields,
      comment: `Solicitação replicada ${now.toISOString()}`,
      process: processId,
    };

    // ---------------------------
    // FLUIG DESTINO
    // ---------------------------
    const externalService = new ExternalService(oauth_destino, url_destino);
    const newProcessId = await externalService.startProcess(payload);

    return {
      message: "Processo replicado com sucesso",
      details: {
        old_id: solicitacao_id,
        new_id: newProcessId,
      },
    };
  } catch (error: any) {
    console.error("Erro ao replicar processo", error);
    if (
      error.message?.includes("inválido") ||
      error.message?.includes("obrigatório")
    ) {
      throw new Error(error.message);
    }
    throw new Error("Erro interno ao processar requisição");
  }
}

function validateUrl(url: string) {
  if (!url.startsWith("https:")) throw new Error("Apenas HTTPS permitido");
}

function validateNumeric(value: any, field: string) {
  if (!/^\d+$/.test(String(value))) throw new Error(`${field} inválido`);
}
