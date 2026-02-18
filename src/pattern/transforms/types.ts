export type TransformFn = (_value: string, _args: readonly string[]) => string;

export type TransformDef = {
  name: string;
  fn: TransformFn;
  doc?: {
    summary: string;
    usage: string[];
    examples?: string[];
  };
};

export type TransformRegistry = Record<string, TransformFn>;
