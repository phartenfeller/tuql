import { MutationOptions, MutationParams } from 'src/types/MutationParams';

export default function getMutationOptions(
  mutations: MutationParams
): MutationOptions {
  if (typeof mutations === 'boolean') {
    return {
      create: mutations,
      update: mutations,
      delete: mutations,
    };
  }

  return {
    create: mutations?.create || false,
    update: mutations?.update || false,
    delete: mutations?.delete || false,
  };
}
