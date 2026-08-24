export interface EnvironmentVariable {
  id: string;
  key: string;
  initialValue: string;
  currentValue: string;
  secret: boolean;
  description: string;
}

export interface EnvironmentListItem {
  id: string;
  name: string;
}
