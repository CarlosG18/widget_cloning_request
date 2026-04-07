import { FluigService } from "./fluigBasic";
import { ExternalService } from "./externalServiceBasic";

export interface ClonningData {
  solicitacao_id: number;
  destination: string;
  url_source: string;
  user_source: string;
  pass_source: string;
}

export async function ClonningRequest(data: ClonningData, fields: string[]) {
  try {
    const destination = new FluigService(data.destination);
    const source = new ExternalService(
      data.user_source,
      data.pass_source,
      data.url_source,
    );

    const fluigData = await source.getRequest(data.solicitacao_id);
    const fluigParams = await source.getParameters(String(data.solicitacao_id));

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
      targetAssignee: targetAssignee || "admin",
      form_fields: formFields,
      comment: "Replicado via Basic Auth",
      process: fluigData.processId,
    };

    const newId = await destination.startProcess(payload);

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

      if (fields.includes(item.field)) {
        value = `${value} (Clone ${timestamp})`;
      }
      formatted[item.field] = value;
    }
  });
  return formatted;
}
