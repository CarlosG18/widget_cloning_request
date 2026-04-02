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

  async getRequest(requestId: number) {
    const url = `/process-management/api/v2/requests/${requestId}`;
    const response = await this.http.get(url, {
      params: { expand: ["formFields"] },
    });
    return response.data;
  }

  async getParameters(solicitationId: string) {
    const url = "/fluighub/rest/service/execute/datasearch";
    const payload = {
      endpoint: "dataset",
      method: "get",
      params: `datasetId=dsGetParams&constraintsField=processInstanceId&constraintsInitialValue=${solicitationId}&constraintsType=MUST`,
    };
    const response = await this.http.post(url, payload);
    return response.data;
  }
}
