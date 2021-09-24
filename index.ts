import getGraphQLSchema from './src/bin';

getGraphQLSchema({
  filePath: '/home/philipp/Code/tuql/data.sqlite',
  mutation: true,
});
