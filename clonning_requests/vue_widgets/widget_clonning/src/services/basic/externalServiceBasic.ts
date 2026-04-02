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

  async startProcess(payload: any): Promise<number> {
    const encryptedProcessId = await this.crypt(payload.process);

    const body = {
      endpoint: "start",
      method: "post",
      params: JSON.stringify({
        targetState: payload.targetState,
        targetAssignee: payload.targetAssignee, // Usuário logado
        formFields: payload.form_fields,
        comment: payload.comment,
      }),
      process: encryptedProcessId,
    };

    const response = await this.http.post(
      "/fluighub/rest/service/execute/movestart-process",
      body,
    );

    // Tratamento de resposta do FluigHub
    const msg =
      typeof response.data.message === "string"
        ? JSON.parse(response.data.message)
        : response.data.message;

    return msg.processInstanceId;
  }

  private async crypt(processId: string) {
    const res = await this.http.post("/fluighub/rest/service/execute/crypto", {
      endpoint: "crypto",
      passphrase: processId,
    });
    return res.data.message;
  }
}
