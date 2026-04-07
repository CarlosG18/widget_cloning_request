import axios from "axios";
import type { AxiosInstance } from "axios";

export class FluigService {
  private http: AxiosInstance;

  constructor(baseUrl: string) {
    this.http = axios.create({
      baseURL: import.meta.env.DEV ? "" : baseUrl.replace(/\/$/, ""),
      timeout: 10000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
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

      const rawMessage = response.data.message;
      const msg =
        typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;

      return msg.processInstanceId;
    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverMessage = error.response.data.message;

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
