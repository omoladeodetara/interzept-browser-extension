export interface Rule {
  id: string;
  name: string;
  type: "overrides" | "redirect" | "headers";
  enabled: boolean;
  source: string;
  destination?: string;
  responseBody?: string;
  responseCode?: number;
  responseHeaders?: { name: string; value: string }[];
  headers?: { name: string; value: string; operation: string }[];
  description?: string;
}

export interface HeaderOperation {
  name: string;
  value: string;
  operation: "add" | "modify" | "remove";
}

export interface RuleTemplate {
  name: string;
  description: string;
  rule: Partial<Rule>;
}
