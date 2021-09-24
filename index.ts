import getGraphQLSchema, { initGraphQLServerArgs } from './src/bin';

function initGraphQLServer({
  filePath,
  mutation,
  expressApp,
}: initGraphQLServerArgs) {
  getGraphQLSchema({
    filePath,
    mutation,
    expressApp,
  });
}

export default initGraphQLServer;
