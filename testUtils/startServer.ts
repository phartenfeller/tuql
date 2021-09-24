import initGraphQLServer from '../index';
import express from 'express';

async function main() {
  const app = express();

  await initGraphQLServer({
    filePath: './testUtils/chinook.db',
    mutation: false,
    expressApp: app,
  });

  app.listen(4000, () =>
    console.log(` > Running at http://localhost:${4000}/graphql`)
  );
}

main();
