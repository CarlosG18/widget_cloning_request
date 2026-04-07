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
        targetAssignee: String(payload.targetAssignee),
        formFields: payload.form_fields,
        comment: String(payload.comment),
      }),
      process: encryptedProcessId,
    };

    console.log("body ->>", body);

    const response = await this.http.post(
      "/fluighub/rest/service/execute/movestart-process",
      JSON.stringify(body),
    );

    // Tratamento de resposta do FluigHub
    let msg;
    const rawMessage = response.data.message;

    // 1. Verificamos se a mensagem existe
    if (!rawMessage) {
        throw new Error("O servidor não retornou nenhuma mensagem.");
    }

    // 2. Tentamos tratar a mensagem (que pode vir como String JSON ou Objeto)
    if (typeof rawMessage === "string") {
      try {
        // Só tentamos o parse se a string parecer um objeto JSON
        if (rawMessage.trim().startsWith("{")) {
          msg = JSON.parse(rawMessage);
        } else {
          // Se for uma string de erro comum (texto puro), lançamos o erro direto
          throw new Error(rawMessage);
        }
      } catch (e) {
        // Se o parse falhar, o erro real está no texto da rawMessage
        throw new Error(`Erro no Fluig: ${rawMessage}`);
      }
    } else {
      msg = rawMessage;
    }

    // 3. Verificamos se temos o ID da solicitação
    if (msg && msg.processInstanceId) {
      return msg.processInstanceId;
    }

    throw new Error("Falha ao iniciar processo: ID não retornado.");
 }

  private async crypt(processId: string) {
    const res = await this.http.post("/fluighub/rest/service/execute/crypto", {
      endpoint: "crypto",
      passphrase: processId,
    });
    return res.data.message;
  }
}
