export type MutationOptions = {
  create: boolean;
  update: boolean;
  delete: boolean;
};

export type MutationParams = boolean | MutationOptions;
