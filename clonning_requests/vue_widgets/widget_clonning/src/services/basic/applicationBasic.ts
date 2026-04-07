import { FluigService } from "./fluigBasic";
import { ExternalService } from "./externalServiceBasic";

export interface ClonningData {
  solicitacao_id: number;
  url_origem: string;
  url_destino: string;
  user_destino: string;
  pass_destino: string;
}

export async function ClonningRequest(data: ClonningData, fields: string[]) {
  try {
    const origem = new FluigService(data.url_origem);
    const fluigData = await origem.getRequest(data.solicitacao_id);
    const fluigParams = await origem.getParameters(String(data.solicitacao_id));

    // 2. Extrai Target State do dataset (conforme sua lógica anterior)
    const msgJson = JSON.parse(fluigParams.message || "{}");
    const targetState = msgJson?.values?.[0]?.targetState;

    var formFields = formatFormFields(fluigData.formFields, fields);

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

function formatFormFields(
  formFields: any,
  fields: string[],
): Record<string, string> {
  const formatted: Record<string, string> = {};
  const timestamp = new Date().getTime();

  Object.values(formFields).forEach((item: any) => {
    if (item && typeof item === "object" && "field" in item) {
      let value = item.value || "";

      // Aplica o sufixo apenas nos campos que costumam ter validação de duplicidade

      if (fields.includes(item.field)) {
        value = `${value} (Clone ${timestamp})`;
      }
      formatted[item.field] = value;
    }
  });
  return formatted;
}
