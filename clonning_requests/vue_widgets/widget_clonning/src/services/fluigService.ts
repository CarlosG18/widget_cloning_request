import type { ClonningData, Params } from "../types/clonning";
import OAuth from "oauth-1.0a";
import CryptoJS from "crypto-js";

export async function ClonningRequest(data: ClonningData) {
  try {
    const urlbase = data.destination;

    // realizar a solicitação para o endpoint do fluig de produção
    const body = {
      endpoint: "",
      method: "",
      params: JSON.stringify({
        solicitacao_id: data.solicitacao_id,
      }),
    };

    const requestData = {
      url: urlbase + body.endpoint,
      method: body.method,
    };

    const headers: any = getOAuthHeader(
      requestData,
      data.consumer_key,
      data.consumer_secret,
    );

    const url = `${urlbase}/fluighub/rest/service/execute/movestart-process`;
    const response = await fetch(url, {
      method: "",
      headers: headers,
      body: JSON.stringify(body),
    });
    const res: any = await response.json();

    if (res.code != 200) {
      throw new Error("Erro ao carregar o arquivo");
    }

    // criando os parametros para a função de start process
    const params: Params = {
      processID: res.processID,
      targetState: res.targetState,
      targetAssignee: res.targetAssignee,
      formFields: res.formFields,
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

    return { success: true, newId };
  } catch (e: any) {
    console.error(e);
    throw new Error("Falha na clonagem: " + e.message);
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
