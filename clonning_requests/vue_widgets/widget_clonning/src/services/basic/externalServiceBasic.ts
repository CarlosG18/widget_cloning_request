import axios from "axios";
import type { AxiosInstance } from "axios";
import { getBasicAuthHeader } from "../../utils/authHelper";

export class ExternalService {
  private http: AxiosInstance;

  constructor(user: string, pass: string, baseUrl: string) {
    this.http = axios.create({
      baseURL: import.meta.env.DEV ? "" : baseUrl.replace(/\/$/, ""),
      timeout: 10000,
      headers: {
        ...getBasicAuthHeader(user, pass),
        "Content-Type": "application/json",
      },
    });
  }

  async getRequest(requestId: number) {
    const url = `/process-management/api/v2/requests/${requestId}`;
    const response = await this.http.get(url, {
      params: { expand: "formFields" },
    });
    return response.data;
  }

  async getParameters(solicitationId: string) {
    const url = "/fluighub/rest/service/execute/datasearch";
    const payload = {
      endpoint: "dataset",
      method: "get",
      params: `datasetId=dsGetParams&constraintsField=processInstanceId&constraintsInitialValue=${solicitationId}&constraintsFinalValue=${solicitationId}&constraintsType=MUST`,
    };
    const response = await this.http.post(url, payload);
    return response.data;
  }

  async startProcess(payload: any): Promise<number> {
    const encryptedProcessId = await this.crypt(payload.process);

    const body = {
      endpoint: "start",
      method: "post",
      params: JSON.stringify({
        targetState: payload.targetState,
        targetAssignee: String(payload.targetAssignee),
        formFields: payload.form_fields,
        comment: String(payload.comment),
      }),
      process: encryptedProcessId,
    };

    try {
      const response = await this.http.post(
        "/fluighub/rest/service/execute/movestart-process",
        JSON.stringify(body),
      );

      // Se chegar aqui, é sucesso (200 OK)
      const rawMessage = response.data.message;
      const msg =
        typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;

      return msg.processInstanceId;
    } catch (error: any) {
      // Aqui capturamos o erro 500 e extraímos a mensagem do FluigHub
      if (error.response && error.response.data) {
        const serverMessage = error.response.data.message;

        // Remove tags HTML da mensagem (como o <ul> e <li> do log) para exibir no widget
        const cleanMessage =
          typeof serverMessage === "string"
            ? serverMessage.replace(/<[^>]*>?/gm, "")
            : JSON.stringify(serverMessage);

        console.error("Erro do FluigHub capturado:", cleanMessage);
        throw new Error(cleanMessage);
      }

      throw new Error(error.message || "Erro desconhecido ao iniciar processo");
    }
  }

  private async crypt(processId: string) {
    const res = await this.http.post("/fluighub/rest/service/execute/crypto", {
      endpoint: "crypto",
      passphrase: processId,
    });
    return res.data.message;
  }
}
