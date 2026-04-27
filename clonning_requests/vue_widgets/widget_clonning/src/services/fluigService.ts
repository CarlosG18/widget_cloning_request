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

import { transformarFields } from "../utils/formatFormFields";

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
      data.servidor,
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
      processID: resDataset[0].processID,
      targetState: resDataset[0].targetState,
      targetAssignee: resDataset[0].targetAssignee,
      formFields: JSON.parse(resDataset[0].formsFields),
    };

    // realizar o encrypto do id_processo
    const encryptedProcessId = await encriptar(
      params.processID,
      data.destination,
    );

    if (!encryptedProcessId || encryptedProcessId.length === 0) {
      throw new Error("Não foi possivel realizar o encrypto do id_processo");
    }

    console.log("Params: ", params);

    // realizar o start process no endpoint do fluig de homologação
    const newId = await initProcess(
      urlbase,
      params.targetState,
      params.targetAssignee,
      transformarFields(params.formFields.formFields),
      encryptedProcessId,
      data.servidor,
    );

    if (!newId || newId.length === 0) {
      throw new Error("Não foi possivel iniciar o processo");
    }

    // data
    const dataAtual = new Date();

    retorno.newId = newId;
    retorno.processId = params.processID;
    retorno.date = dataAtual.toISOString();
    retorno.success = true;

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

    // realizar a solicitação para o endpoint do fluig de produção
    const resDataset = await getDataset(data.url_source, datasetName, [
      {
        field: "documentId",
        initialValue: data.documentId.toString(),
        finalValue: data.documentId.toString(),
        type: "MUST",
      },
    ]);

    if (!resDataset || resDataset.length === 0) {
      throw new Error("Não foi possivel acessar o dataset");
    }

    return resDataset;
  } catch (e: any) {
    console.error("erro completo:", e);
    throw new Error("Erro na solicitação");
  }
}
