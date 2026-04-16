import type {
  ClonningData,
  Params,
  Response,
  FormsIntData,
} from "../types/clonning";
import {
  encriptar,
  initProcess,
  getdatasetAuth,
  getDataset,
} from "./utilsServices";

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
      "STRATEGI",
      [
        {
          field: "processInstanceId",
          initialValue: data.solicitacao_id.toString(),
          finalValue: data.solicitacao_id.toString(),
          type: "MUST",
        },
      ],
    );

    if (!resDataset || resDataset.length === 0) {
      throw new Error("Não foi possivel acessar o dataset com autenticação");
    }

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

    if (!encryptedProcessId || encryptedProcessId.length === 0) {
      throw new Error("Não foi possivel realizar o encrypto do id_processo");
    }

    // realizar o start process no endpoint do fluig de homologação
    const newId = await initProcess(
      urlbase,
      params.targetState,
      params.targetAssignee,
      params.formFields,
      encryptedProcessId,
    );

    if (!newId || newId.length === 0) {
      throw new Error("Não foi possivel iniciar o processo");
    }

    // data
    const dataAtual = new Date();

    retorno.newId = newId;
    retorno.processId = params.processID;
    retorno.date = dataAtual.toISOString();

    return retorno;
  } catch (e: any) {
    console.error("erro completo:", e);

    retorno.success = false;

    if (e?.message) {
      retorno.error = e.message;
    } else if (typeof e === "string") {
      retorno.error = e;
    } else if (e?.response?.data) {
      retorno.error = JSON.stringify(e.response.data);
    } else {
      retorno.error = "Erro desconhecido";
    }

    return retorno;
  }
}

export async function ClonningFormsInt(data: FormsIntData) {
  try {
    // obter o dataset pelo id do documento -> usando o dataset document
    const documentIdRaizSearch = await getDataset(data.url_source, "document", [
      {
        field: "documentPK.documentId",
        initialValue: data.documentId.toString(),
        finalValue: data.documentId.toString(),
        type: "MUST",
      },
    ]);

    const documentIdRaiz = documentIdRaizSearch[0].documentPropertyNumber;

    console.log("documentIdRaiz: ", documentIdRaiz);

    const dataset = await getDataset(data.url_source, "document", [
      {
        field: "documentPK.documentId",
        initialValue: documentIdRaiz,
        finalValue: documentIdRaiz,
        type: "MUST",
      },
    ]);

    // pegando o nome do dataset
    const datasetName = dataset[0].datasetName;

    console.log("datasetName: ", datasetName);

    // realizar a solicitação para o endpoint do fluig de produção
    const resDataset = await getDataset(data.url_source, datasetName, [
      {
        field: "documentId",
        initialValue: data.documentId.toString(),
        finalValue: data.documentId.toString(),
        type: "MUST",
      },
    ]);

    console.log("resDataset: ", resDataset);

    if (!resDataset || resDataset.length === 0) {
      throw new Error("Não foi possivel acessar o dataset");
    }

    return resDataset;
  } catch (e: any) {
    console.error("erro completo:", e);
    throw new Error("Erro na solicitação");
  }
}
