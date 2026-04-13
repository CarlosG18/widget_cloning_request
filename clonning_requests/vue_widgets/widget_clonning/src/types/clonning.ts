export interface ClonningData {
  solicitacao_id: number;
  destination: string;
  url_source: string;
  consumer_key: string;
  consumer_secret: string;
}

export interface Params {
  processID: string;
  targetState: Number;
  targetAssignee: string;
  formFields: any;
}
