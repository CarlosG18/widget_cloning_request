import type { Filter } from "../types/clonning";
import type { UploadAnexoParams, AttachUserInfo } from "../types/clonning";
import {
  createPdfFileFromBase64,
  ensurePdfFileName,
} from "../utils/uploadImageUtils";

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

      if (retryCount < maxRetries) {
        if (retryCount === 1) {
          currentAssignee = "";
        } else if (retryCount === 2) {
          currentAssignee = await getFirstUserFromServer(
            baseUrl,
            type_credentials,
          );
        }
        // Aguardar um pouco antes de retentar (backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        return executeRequest();
      } else {
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

async function parseServiceResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function getAttachUserInfo(
  baseUrl: string,
  type_credentials?: string,
): Promise<AttachUserInfo> {
  const fluigWindow = window as Window & {
    WCMAPI?: {
      userCode?: string;
      user?: string;
    };
  };

  const userCode = fluigWindow.WCMAPI?.userCode || "";
  const userName = fluigWindow.WCMAPI?.user || "";

  if (userCode) {
    return {
      taskUserId: userCode,
      attachedUser: userName || userCode,
    };
  }

  if (type_credentials) {
    const users = await getdatasetAuth(baseUrl, "colleague", type_credentials);
    const firstUser = users?.[0];

    if (firstUser) {
      return {
        taskUserId: firstUser.login || firstUser.colleaguePK?.colleagueId || "",
        attachedUser:
          firstUser.colleagueName ||
          firstUser.mail ||
          firstUser.login ||
          "Usuário Fluig",
      };
    }
  }

  throw new Error("Não foi possível identificar o usuário do Fluig");
}

export async function UploadAnexo(
  anexo: UploadAnexoParams,
  processInstanceId: string | number,
  baseUrl = window.location.origin,
  monthFolder: string,
  type_credentials?: string,
) {
  try {
    if (!anexo?.base64) {
      throw new Error("O anexo informado não possui conteúdo em base64");
    }

    if (!processInstanceId) {
      throw new Error("processInstanceId não informado");
    }

    const pdfFile = createPdfFileFromBase64(anexo.base64, anexo.fileName);
    const normalizedFileName = ensurePdfFileName(anexo.fileName);
    const userInfo = await getAttachUserInfo(baseUrl, type_credentials);

    const uploadFormData = new FormData();
    uploadFormData.append("file", pdfFile);
    uploadFormData.append("pathId", monthFolder);
    uploadFormData.append("nameFile", normalizedFileName);

    const uploadResponse = await fetch(
      `${baseUrl}/fluighub/rest/service/execute/uploadfile`,
      {
        method: "POST",
        body: uploadFormData,
      },
    );

    const uploadResult: any = await parseServiceResponse(uploadResponse);

    if (
      !uploadResponse.ok ||
      (typeof uploadResult?.code !== "undefined" && uploadResult.code !== 200)
    ) {
      throw new Error(
        extractErrorMessage(
          uploadResponse,
          uploadResult,
          "Erro ao enviar o anexo para upload",
        ),
      );
    }

    return {
      success: true,
      documentId: uploadResult.documentId,
      userInfo: {
        taskUserId: userInfo.taskUserId,
        attachedUser: userInfo.attachedUser,
      },
      fileName: normalizedFileName,
    };
  } catch (err) {
    console.error("Erro ao realizar upload do anexo:", err);
    throw err;
  }
}

export async function attachDocument(
  documentId: string | number,
  processInstanceId: string | number,
  userInfo: AttachUserInfo,
  processId: string | number,
  baseUrl = window.location.origin,
) {
  const normalizedFileName = ensurePdfFileName(userInfo.attachedUser);

  const attachPayload = {
    processId: processId,
    version: -1,
    managerMode: false,
    taskUserId: userInfo.taskUserId,
    processInstanceId: Number(processInstanceId),
    isDigitalSigned: false,
    selectedState: null,
    attachments: [
      {
        name: normalizedFileName,
        newAttach: true,
        description: normalizedFileName,
        documentId: documentId,
        attachedUser: userInfo.attachedUser,
        attachments: [
          {
            principal: true,
            fileName: normalizedFileName,
          },
        ],
      },
    ],
    currentMovto: null,
  };

  const attachResponse = await fetch(
    `${baseUrl}/fluighub/rest/service/execute/attach`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attachPayload),
    },
  );

  const attachResult: any = await parseServiceResponse(attachResponse);

  if (
    !attachResponse.ok ||
    (typeof attachResult?.code !== "undefined" && attachResult.code !== 200)
  ) {
    throw new Error(
      extractErrorMessage(
        attachResponse,
        attachResult,
        "Erro ao anexar documento ao processo",
      ),
    );
  }

  return {
    success: true,
    attach: attachResult,
    fileName: normalizedFileName,
    processInstanceId: Number(processInstanceId),
  };
}

export async function createFolder(
  folderName: string,
  pathId: string | number,
  baseUrl = window.location.origin,
) {
  const options = {
    foldername: folderName,
    pathId: pathId,
  };

  try {
    const url = `${baseUrl}/fluighub/rest/service/execute/folder`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    const res: any = await response.json();
    if (res.code != 200) {
      throw new Error("Erro ao criar pastas");
    }

    return res.message; // vai ser o id da pasta
  } catch (err) {
    console.error("Erro ao criar pastas:", err);
    throw err;
  }
}
