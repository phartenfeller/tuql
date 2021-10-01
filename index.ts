import getGraphQLSchema, { initGraphQLServerArgs } from './src/bin';

function initGraphQLServer({
  filePath,
  mutations = false,
}: initGraphQLServerArgs) {
  return getGraphQLSchema({
    filePath,
    mutations,
  });
}

export default initGraphQLServer;
