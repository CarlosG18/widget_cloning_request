import axios from "axios";
import type { AxiosInstance } from "axios";
import {
  createOAuthInterceptor,
  type OAuthCredentials,
} from "../../utils/oauthInterceptor";

const DEFAULT_TIMEOUT = 10000;

export class ExternalService {
  private urlDestino: string;
  private http: AxiosInstance;

  constructor(credentials: OAuthCredentials, urlDestino: string) {
    this.validateUrl(urlDestino);
    this.urlDestino = urlDestino.replace(/\/$/, "");

    this.http = axios.create({
      baseURL: import.meta.env.DEV ? "" : this.urlDestino,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.http.interceptors.request.use(createOAuthInterceptor(credentials));
  }

  private validateUrl(url: string) {
    if (!url || !url.startsWith("https://")) {
      throw new Error("Apenas URLs HTTPS são permitidas");
    }
  }

  async startProcess(payload: any): Promise<number> {
    if (!payload || typeof payload !== "object")
      throw new Error("Payload inválido");

    const url = "/fluighub/rest/service/execute/movestart-process";

    // Normalização (Mantida a sua lógica original)
    let normalizedFormFields: Record<string, any> = {};
    if (Array.isArray(payload.form_fields)) {
      for (const item of payload.form_fields) {
        if (typeof item !== "object") continue;
        const fieldName = item.field || item.name || item.key;
        if (!fieldName) continue;
        normalizedFormFields[fieldName] =
          item.value ?? item.values ?? item.data;
      }
    } else if (typeof payload.form_fields === "object") {
      normalizedFormFields = { ...payload.form_fields };
    }
    delete normalizedFormFields["formFields"];

    const params = JSON.stringify({
      targetState: Number(payload.targetState),
      targetAssignee: String(payload.targetAssignee).trim(),
      comment: payload.comment || `Solicitação aberta via API`,
      formFields: normalizedFormFields,
    });

    let processId = await this.crypt(payload.process);

    const body: any = {
      endpoint: "start",
      method: "post",
      params,
      process: processId,
    };

    try {
      let response = await this.http.post(url, body);

      // Fallback JSON bug Fluig (Mantido da sua lógica original)
      if (response.status === 400 && String(response.data).includes("JSON")) {
        body.params = JSON.stringify(params);
        response = await this.http.post(url, body);
      }

      return this.parseResponse(response.data);
    } catch (error) {
      console.error("Erro ao iniciar processo FluigHub", error);
      throw new Error("Erro de conexão com FluigHub");
    }
  }

  private parseResponse(data: any): number {
    if (data?.code !== 200)
      throw new Error(`Erro FluigHub: ${JSON.stringify(data)}`);

    let message =
      typeof data.message === "string"
        ? JSON.parse(data.message)
        : data.message;
    if (message?.processInstanceId) return message.processInstanceId;

    throw new Error("Formato inesperado da resposta");
  }

  private async crypt(processId: string): Promise<string> {
    const url = "/fluighub/rest/service/execute/crypto";
    try {
      // Axios isolado sem interceptor OAuth se essa rota específica for pública/diferente
      // Caso a rota crypto exija OAuth, use this.http.post
      const response = await this.http.post(url, {
        endpoint: "crypto",
        passphrase: processId,
      });
      return this.extractCrypto(response.data);
    } catch (error) {
      throw new Error("Erro de conexão no crypt");
    }
  }

  private extractCrypto(data: any): string {
    const msg = data?.message;
    if (typeof msg === "string") return msg;
    if (typeof msg === "object")
      return msg.password || msg.decrypted || msg.value || msg.passphrase;
    if (data?.data) return data.data;
    throw new Error("Resposta inesperada no crypto");
  }
}
