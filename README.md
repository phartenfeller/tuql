# @phartenfeller/tuql 

Fork of [tuql](https://github.com/bradleyboy/tuql) without CLI but usable as a library.

Example implementation:

```js
import initGraphQLServer from '@phartenfeller/tuql';
import express from 'express';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';

async function main() {
  const app = express();

  const schema = await initGraphQLServer({
    filePath: './testUtils/chinook.db',
    mutations: false
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

```
