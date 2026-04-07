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

    console.log("fluigParams ->>", fluigParams);
    console.log("fluigData ->>", fluigData);

    // 2. Extrai Target State do dataset (conforme sua lógica anterior)
    const msgJson = JSON.parse(fluigParams.message || "{}");
    const targetState = msgJson?.values?.[0]?.targetState;

    const formFields = formatFormFields(fluigData.formFields);
    console.log("formFields ->>", formFields);

    // obtendo o targetAssignee do dataset
    const targetAssignee = msgJson?.values?.[0]?.targetAssignee;

    if (!targetState)
      throw new Error("Não foi possível localizar o Estado de Destino.");

    // 3. Prepara Payload
    const payload = {
      targetState: targetState,
      targetAssignee: targetAssignee || "admin", // O processo iniciará para quem está logado
      form_fields: formFields,
      comment: "Replicado via Basic Auth",
      process: fluigData.processId,
    };

    console.log("Payload preparado ->>", payload);

    // 4. Instancia Destino (Usuário Logado)
    const destino = new ExternalService(
      data.user_destino,
      data.pass_destino,
      data.url_destino,
    );
    const newId = await destino.startProcess(payload);

    return { success: true, newId };
  } catch (e: any) {
    // Log detalhado para diagnóstico
    console.error(e);
    throw new Error("Falha na clonagem: " + e.message);
  }
}

function formatFormFields(formFields: any): Record<string, string> {
  const formatted: Record<string, string> = {};

  // Object.values garante a iteração quer receba um Array ou um Objeto indexado
  Object.values(formFields).forEach((item: any) => {
    if (item && typeof item === "object" && "field" in item) {
      formatted[item.field] = item.value || "";
    }
  });

  return formatted;
}