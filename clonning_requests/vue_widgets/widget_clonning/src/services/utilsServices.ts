import type { Filter } from "../types/clonning";
import OAuth from "oauth-1.0a";
import CryptoJS from "crypto-js";

// Extrai o primeiro assignee de uma lista separada por vírgula
function extractFirstAssignee(targetAssignee: string): string {
  if (!targetAssignee || typeof targetAssignee !== "string") {
    return "";
  }

  const firstAssignee = targetAssignee.split(",")[0].trim();
  return firstAssignee;
}

// Função para obter o primeiro usuário do servidor
export async function getFirstUserFromServer(
  baseUrl: string,
  type_credentials: string,
): Promise<string> {
  try {
    const users = await getdatasetAuth(baseUrl, "colleague", type_credentials);
    if (users && users.length > 0) {
      return users[0].login || users[0].colleagueName || "";
    }
    return "";
  } catch (err) {
    console.warn("Erro ao obter usuários do servidor:", err);
    return "";
  }
}

// Função auxiliar para extrair mensagens de erro
function extractErrorMessage(
  response?: Response,
  res?: any,
  fallback = "Erro na requisição",
) {
  const message = res?.message ?? res?.error ?? res?.detail;

  if (typeof message === "string") {
    try {
      const parsedMessage = JSON.parse(message);
      return (
        parsedMessage?.message ||
        parsedMessage?.error ||
        parsedMessage?.detail ||
        message
      );
    } catch {
      return message;
    }
  }

  if (message && typeof message === "object") {
    return message.message || message.error || message.detail || fallback;
  }

  return response?.statusText || fallback;
}

export async function initProcess(
  baseUrl: string,
  targetState: Number,
  targetAssignee: string,
  formFields: any,
  codProcess: string,
  type_credentials: string,
) {
  const maxRetries = 3;
  let retryCount = 0;
  let currentAssignee = extractFirstAssignee(targetAssignee);

  const executeRequest = async (): Promise<string | undefined> => {
    try {
      const date = new Date().toISOString().split("T")[0];
      const time = new Date().toISOString().split("T")[1];

      const body = {
        endpoint: "start",
        method: "post",
        params: JSON.stringify({
          targetState: targetState,
          targetAssignee: currentAssignee,
          comment: `Clonagem Realizada - por widget clonning requests - ${date} ${time}`,
          formFields: formFields,
        }),
        process: codProcess,
      };

      const url = `${baseUrl}/fluighub/rest/service/execute/movestart-process`;
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const res: any = await response.json();

      if (response.status !== 200 || res.code !== 200) {
        throw new Error(
          extractErrorMessage(response, res, "Erro ao iniciar o processo"),
        );
      }

      return JSON.parse(res.message).processInstanceId;
    } catch (err) {
      retryCount++;
      console.log(`Tentativa ${retryCount} falhou:`, err);

      if (retryCount < maxRetries) {
        if (retryCount === 1) {
          currentAssignee = "";
        } else if (retryCount === 2) {
          currentAssignee = await getFirstUserFromServer(
            baseUrl,
            type_credentials,
          );
        }
        console.log(`Retentando... (${retryCount}/${maxRetries})`);
        // Aguardar um pouco antes de retentar (backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        return executeRequest();
      } else {
        console.log("Máximo de tentativas atingido");
        throw err;
      }
    }
  };

  return executeRequest();
}

export async function encriptar(id_processo: string, baseUrl: string) {
  try {
    var url = `${baseUrl}/fluighub/rest/service/execute/crypto`;

    var response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        endpoint: "crypto",
        passphrase: id_processo,
      }),
    });

    var res = await response.json();

    if (response.status !== 200 || res.code !== 200) {
      throw new Error(extractErrorMessage(response, res, "Erro ao encriptar"));
    }

    return res.message;
  } catch (err) {
    console.log("Erro ao encriptar", err);
    throw err;
  }
}

export async function getDataset(
  baseUrl: string,
  datasetId: string,
  filters?: Filter[],
  search?: boolean,
) {
  const options = {
    endpoint: "dataset",
    method: "get",
    likeSearch: search ? true : false,
    params: `datasetId=${datasetId}${filters ? filters.map((f) => `&constraintsField=${f.field}&constraintsInitialValue=${f.initialValue}&constraintsFinalValue=${f.finalValue}${f.type ? `&constraintsType=${f.type}` : ""}`).join("") : ""}`,
  };

  try {
    const url = `${baseUrl}/fluighub/rest/service/execute/datasearch`;

    console.log("URL: ", url);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    const res: any = await response.json();

    if (response.status !== 200 || res.code !== 200) {
      throw new Error(
        extractErrorMessage(response, res, "Erro ao buscar dados"),
      );
    }

    let resMessage = res.message;

    if (typeof res.message === "string") {
      resMessage = JSON.parse(res.message);
    }

    if (resMessage?.values && Array.isArray(resMessage.values)) {
      return resMessage.values;
    }

    return [];
  } catch (err) {
    throw err;
  } finally {
  }
}

export async function getdatasetAuth(
  baseUrl: string,
  datasetId: string,
  type_credentials: string,
  filters?: Filter[],
) {
  const oauth = new OAuth({
    consumer: {
      key: import.meta.env[`VITE_CONSUMER_KEY_${type_credentials}`],
      secret: import.meta.env[`VITE_CONSUMER_SECRET_${type_credentials}`],
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
    },
  });

  const token = {
    key: import.meta.env[`VITE_ACCESS_TOKEN_${type_credentials}`],
    secret: import.meta.env[`VITE_TOKEN_SECRET_${type_credentials}`],
  };

  const url = `${baseUrl}/fluighub/rest/service/execute/datasearchauth`;

  const options = {
    endpoint: "dataset",
    method: "get",
    params: `datasetId=${datasetId}${filters ? filters.map((f) => `&constraintsField=${f.field}&constraintsInitialValue=${f.initialValue}`).join("") : ""}`,
  };

  const request_data = {
    url: url,
    method: "POST",
  };

  const authData = oauth.authorize(request_data, token);
  const authHeaderObj = oauth.toHeader(authData);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...authHeaderObj,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    const res: any = await response.json();

    if (response.status !== 200 || res.code !== 200) {
      throw new Error(
        extractErrorMessage(response, res, "Erro ao buscar dados"),
      );
    }

    let resMessage = res.message;
    if (typeof res.message === "string") {
      resMessage = JSON.parse(res.message);
    }

    if (resMessage?.values && Array.isArray(resMessage.values)) {
      return resMessage.values;
    }

    return [];
  } catch (err) {
    console.error("Erro OAuth Fetch: ", err);
    throw err;
  }
}
