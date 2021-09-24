import initGraphQLServer from '../index';
import express from 'express';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';

async function main() {
  const app = express();

  const schema = await initGraphQLServer({
    filePath: './testUtils/chinook.db',
    mutation: false,
    expressApp: app,
  });

  app.use(
    '/graphql',
    cors(),
    graphqlHTTP({
      schema,
      graphiql: true,
    })
  );

  app.listen(4000, () =>
    console.log(` > Running at http://localhost:${4000}/graphql`)
  );
}

main();
