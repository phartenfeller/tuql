import getGraphQLSchema, { initGraphQLServerArgs } from './src/bin';

function initGraphQLServer({ filePath, mutation }: initGraphQLServerArgs) {
  return getGraphQLSchema({
    filePath,
    mutation,
  });
}

export default initGraphQLServer;
