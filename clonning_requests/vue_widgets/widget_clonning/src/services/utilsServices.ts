import type { Filter } from "../types/clonning";

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
