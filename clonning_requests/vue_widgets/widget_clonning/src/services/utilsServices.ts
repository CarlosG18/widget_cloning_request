import type { Filter } from "../types/clonning";
import OAuth from "oauth-1.0a";
import CryptoJS from "crypto-js";

export async function initProcess(
  baseUrl: string,
  targetState: Number,
  targetAssignee: string,
  formFields: any,
  codProcess: string,
) {
  const date = new Date().toISOString().split("T")[0];
  const time = new Date().toISOString().split("T")[1];

  const body = {
    endpoint: "start",
    method: "post",
    params: JSON.stringify({
      targetState: targetState,
      targetAssignee: targetAssignee, // trocar para o grupo correto quando subir para produção
      comment: `Solicitação aberta ${date} ${time}`,
      formFields: formFields,
    }),
    process: codProcess,
  };

  try {
    const url = `${baseUrl}/fluighub/rest/service/execute/movestart-process`;
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res: any = await response.json();

    if (res.code != 200) {
      throw new Error("Erro ao carregar o arquivo");
    }

    return JSON.parse(res.message).processInstanceId;
  } catch (err) {
    console.log(err);
  }
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

    if (res.code != 200) {
      throw new Error("Erro em encriptar");
    }

    return res.message;
  } catch (err) {
    console.log("Erro ao encriptar", err);
    return null;
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

    if (response.status != 200) {
      throw new Error("Erro ao buscar dados!");
    }

    if (res.code != 200) {
      throw new Error("Erro ao buscar dados!");
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
    return [];
  } finally {
  }
}

/*export async function getdatasetAuth(
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
    const url = `${baseUrl}/fluighub/rest/service/execute/datasearchauth`;

    console.log("URL: ", url);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ACCESS_TOKEN: "",
        TOKEN_SECRET: "",
      },
      body: JSON.stringify(options),
    });
    const res: any = await response.json();

    if (response.status != 200) {
      throw new Error("Erro ao buscar dados!");
    }

    if (res.code != 200) {
      throw new Error("Erro ao buscar dados!");
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
    return [];
  } finally {
  }
}*/

export async function getdatasetAuth(
  baseUrl: string,
  datasetId: string,
  type_credentials: "STRATEGI" | "SEBRAE",
  filters?: Filter[],
) {
  const credentials = {
    STRATEGI: {
      ck: import.meta.env.VITE_CONSUMER_KEY_STRATEGI_HML,
      cs: import.meta.env.VITE_CONSUMER_SECRET_STRATEGI_HML,
      at: import.meta.env.VITE_ACCESS_TOKEN_STRATEGI_HML,
      ts: import.meta.env.VITE_TOKEN_SECRET_STRATEGI_HML,
    },
    SEBRAE: {
      ck: import.meta.env.VITE_CONSUMER_KEY_SEBRAERN_HML,
      cs: import.meta.env.VITE_CONSUMER_SECRET_SEBRAERN_HML,
      at: import.meta.env.VITE_ACCESS_TOKEN_SEBRAERN_HML,
      ts: import.meta.env.VITE_TOKEN_SECRET_SEBRAERN_HML,
    },
  };

  const oauth = new OAuth({
    consumer: {
      key: credentials[type_credentials].ck,
      secret: credentials[type_credentials].cs,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
    },
  });

  const token = {
    key: credentials[type_credentials].cs,
    secret: credentials[type_credentials].ts,
  };

  const url = `${baseUrl}/fluighub/rest/service/execute/datasearchauth`;

  const options = {
    endpoint: "dataset",
    method: "get",
    params: `datasetId=${datasetId}${filters ? filters.map((f) => `&constraintsField=${f.field}&constraintsInitialValue=${f.initialValue})`).join("") : ""}`,
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
        Authorization: authHeaderObj.Authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    const res: any = await response.json();

    if (response.status !== 200 || res.code !== 200) {
      throw new Error("Erro ao buscar dados!");
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
    return [];
  }
}
