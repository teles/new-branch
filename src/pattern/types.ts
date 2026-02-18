export type TransformNode = {
  name: string;
  args: string[];
};

export type VariableNode = {
  kind: "variable";
  name: string;
  transforms: TransformNode[];
};

export type LiteralNode = {
  kind: "literal";
  value: string;
};

export type ParsedPattern = {
  nodes: PatternNode[];
  variablesUsed: string[];
};

export type PatternNode = VariableNode | LiteralNode;
