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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

  async getParameters(solicitationId: string, urlSource: string) {
    const url = "/fluighub/rest/service/execute/datasearch";
    const payload = {
      endpoint: "dataset",
      method: "get",
      params: `datasetId=dsGetParams&constraintsField=processInstanceId&constraintsInitialValue=${solicitationId}&constraintsFinalValue=${solicitationId}&constraintsType=MUST&constraintsField=urlSource&constraintsInitialValue=${urlSource}&constraintsFinalValue=${urlSource}&constraintsType=MUST`,
    };
    const response = await this.http.post(url, payload);
    return response.data;
  }
}
