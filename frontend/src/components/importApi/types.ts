export type EndpointMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ImportedEndpoint {
  id: string;
  method: EndpointMethod;
  path: string;
}

export interface ApiDefinitionPreview {
  title: string;
  spec: string;
  baseUrl: string;
  endpoints: ImportedEndpoint[];
  extraEndpoints: number;
}
