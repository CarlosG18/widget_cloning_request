import { FluigService } from "./fluigBasic";
import { ExternalService } from "./externalServiceBasic";

export interface ClonningData {
  solicitacao_id: number;
  url_origem: string;
  url_destino: string;
  user_destino: string;
  pass_destino: string;
}

export async function ClonningRequest(data: ClonningData) {
  try {
    const origem = new FluigService(data.url_origem);
    const fluigData = await origem.getRequest(data.solicitacao_id);
    const fluigParams = await origem.getParameters(String(data.solicitacao_id));

    console.log(fluigParams);

    // 2. Extrai Target State do dataset (conforme sua lógica anterior)
    const msgJson = JSON.parse(fluigParams.message || "{}");
    const targetState = msgJson?.values?.[0]?.targetState;

    if (!targetState)
      throw new Error("Não foi possível localizar o Estado de Destino.");

    // 3. Prepara Payload
    const payload = {
      targetState,
      targetAssignee: "admin", // O processo iniciará para quem está logado
      form_fields: fluigData.formFields || {},
      comment: "Replicado via Basic Auth",
      process: fluigData.processId,
    };

    // 4. Instancia Destino (Usuário Logado)
    const destino = new ExternalService(
      data.user_destino,
      data.pass_destino,
      data.url_destino,
    );
    const newId = await destino.startProcess(payload);

    return { success: true, newId };
  } catch (e: any) {
    console.error(e);
    throw new Error("Falha na clonagem: " + e.message);
  }
}
