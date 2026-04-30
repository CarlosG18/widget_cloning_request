export interface ClonningData {
  solicitacao_id: number;
  destination: string;
  url_source: string;
  servidor: string;
}

export interface FormsIntData {
  documentId: number;
  destination: string;
  url_source: string;
}

export interface Params {
  processID: string;
  targetState: Number;
  targetAssignee: string;
  formFields: any;
}

export interface Filter {
  field: string;
  initialValue: string;
  finalValue: string;
  type?: string;
}

export interface Response {
  success: boolean;
  newId: string;
  processId: string;
  date: string;
  error?: string;
}

export type UploadAnexoParams = {
  documentId: string | number;
  fileName: string;
  base64: string;
};

export type AttachUserInfo = {
  taskUserId: string;
  attachedUser: string;
};
