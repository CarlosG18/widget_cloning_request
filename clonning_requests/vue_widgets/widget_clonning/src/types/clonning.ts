export interface ClonningData {
  solicitacao_id: number;
  destination: string;
  url_source: string;
  //consumer_key: string;
  //consumer_secret: string;
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
