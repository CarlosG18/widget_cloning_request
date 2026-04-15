import type { ClonningData, Params, Filter, Response } from "../types/clonning";
import OAuth from "oauth-1.0a";
import CryptoJS from "crypto-js";

export async function ClonningRequest(data: ClonningData) {
  const retorno: Response = {
    success: false,
    newId: "",
    processId: "",
    date: "",
    error: "",
  };

  try {
    const urlbase = data.destination;

    // realizar a solicitação para o endpoint do fluig de produção
    const resDataset = await getdatasetAuth(
      data.url_source,
      "dsGetParamsClone",
      [
        {
          field: "processInstanceId",
          initialValue: data.solicitacao_id.toString(),
          finalValue: data.solicitacao_id.toString(),
          type: "MUST",
        },
      ],
    );

    // criando os parametros para a função de start process
    const params: Params = {
      processID: resDataset.processID,
      targetState: resDataset.targetState,
      targetAssignee: resDataset.targetAssignee,
      formFields: resDataset.formFields,
    };

    // realizar o encrypto do id_processo
    const encryptedProcessId = await encriptar(
      params.processID,
      data.destination,
    );

    // realizar o start process no endpoint do fluig de homologação
    const newId = await initProcess(
      urlbase,
      params.targetState,
      params.targetAssignee,
      params.formFields,
      encryptedProcessId,
    );

    // data
    const dataAtual = new Date();

    retorno.newId = newId;
    retorno.processId = params.processID;
    retorno.date = dataAtual.toISOString();

    return retorno;
  } catch (e: any) {
    console.error("erro ->>>>>>>>>>>>>>>>>>>>>", e);
    retorno.success = false;
    retorno.error = e.message;
    return retorno;
  }
}

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

export function getOAuthHeader(
  requestData: any,
  consumerKey: string,
  consumerSecret: string,
) {
  // token do fluig de producao do sabrae
  //   const token = {
  //     key: "33586d58-8adf-4a44-80d1-9ffe17866c62",
  //     secret:
  //       "543ecd89-908f-4681-8b8f-32ac719a115b04ae763c-51e0-436f-908a-66635a83807d",
  //   };

  // token do fluig da strategi
  const token = {
    key: "",
    secret: "",
  };

  const oauth = new OAuth({
    consumer: {
      key: consumerKey,
      secret: consumerSecret,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string: string, key: string) {
      return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
    },
  });

  // Gera o objeto de autorização
  return oauth.toHeader(oauth.authorize(requestData, token));
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

export async function getdatasetAuth(
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
        ACCESS_TOKEN: "d9c659b5-8ab0-48e6-9f33-e5fb259fe125",
        TOKEN_SECRET:
          "010b537f-7308-4b12-b2f4-8f477cb6c7f7ef11a573-bb30-450f-84ec-ccd1613283a0",
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
}

export function decryptAES(encryptedBase64: string): string {
  const key = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_KEY_CRYPTO);

  const decrypted = CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64),
    } as any,
    key,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}
