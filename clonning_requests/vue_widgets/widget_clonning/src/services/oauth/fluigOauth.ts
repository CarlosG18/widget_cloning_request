import axios from "axios";
import type { AxiosInstance } from "axios";
import {
  createOAuthInterceptor,
  type OAuthCredentials,
} from "../../utils/oauthInterceptor";

const DEFAULT_TIMEOUT = 10000;

export class FluigService {
  private baseUrl: string;
  private http: AxiosInstance;

  constructor(credentials: OAuthCredentials, baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    const baseURL = import.meta.env.DEV ? "" : this.baseUrl;

    this.http = axios.create({
      baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Injeta a assinatura OAuth em todas as requisições automaticamente
    this.http.interceptors.request.use(createOAuthInterceptor(credentials));
  }

  // ---------------------------
  // VALIDADORES
  // ---------------------------
  private validateNumeric(value: any, fieldName = "id") {
    if (!/^\d+$/.test(String(value))) {
      throw new Error(`${fieldName} inválido`);
    }
  }

  private sanitizeSolicitationId(value: string): string {
    if (!/^\d+$/.test(value)) {
      throw new Error("solicitação inválida");
    }
    return value;
  }

  // ---------------------------
  // GET REQUEST
  // ---------------------------
  async getRequest(requestId: number): Promise<any> {
    this.validateNumeric(requestId, "request_id");
    const url = `/process-management/api/v2/requests/${requestId}`;

    try {
      const response = await this.http.get(url, {
        params: { expand: ["formFields", "formRecord", "activities"] },
      });
      return response.data;
    } catch (error) {
      console.error("Erro no getRequest", error);
      throw new Error("Erro ao buscar request no Fluig");
    }
  }

  // ---------------------------
  // DATASET PARAMETERS
  // ---------------------------
  async getParameters(solicitationId: string): Promise<any> {
    const safeId = this.sanitizeSolicitationId(solicitationId);
    const url = "/fluighub/rest/service/execute/datasearch";

    const payload = {
      endpoint: "dataset",
      method: "get",
      likeSearch: false,
      params: `datasetId=dsGetParams&constraintsField=processInstanceId&constraintsInitialValue=${safeId}&constraintsFinalValue=${safeId}&constraintsType=MUST`,
    };

    try {
      const response = await this.http.post(url, payload);
      return response.data;
    } catch (error) {
      console.error("Erro no dataset", error);
      throw new Error("Erro ao buscar parâmetros no Fluig");
    }
  }
}
