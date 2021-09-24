import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import fs from 'fs';
import { printSchema } from 'graphql';
import { buildSchemaFromDatabase } from '../builders/schema';

const FilePath = path => {
  if (!fs.existsSync(path)) {
    console.log('');
    console.error(` > File does not exist: ${path}`);
    process.exit();
  }

  return fs.realpathSync(path);
};

type props = {
  filePath: string;
  mutation: boolean;
};

async function getGraphQLSchema({ filePath, mutation }: props) {
  const schema = await buildSchemaFromDatabase({ databaseFile: filePath });
  console.log(printSchema(schema));

  const app = express();

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

/*
const optionDefinitions = [
  {
    name: 'graphiql',
    alias: 'g',
    type: Boolean,
    description: 'Enable graphiql UI',
  },
  {
    name: 'db',
    type: FilePath,
    defaultValue: 'database.sqlite',
    description:
      'Path to the sqlite database you want to create a graphql endpoint for',
  },
  {
    name: 'infile',
    type: FilePath,
    description: 'Path to a sql file to bootstrap an in-memory database with',
  },
  {
    name: 'port',
    alias: 'p',
    type: Number,
    defaultValue: 4000,
    description: 'Port to run on (Default: 4000)',
  },
  {
    name: 'schema',
    alias: 's',
    type: Boolean,
    description: 'Write string representation of schema to stdout',
  },
  { name: 'help', alias: 'h', type: Boolean, description: 'This help output' },
];

const options = commandLineArgs(optionDefinitions);

if (options.help) {
  const usage = commandLineUsage([
    {
      header: 'tuql',
      content:
        '{underline tuql} turns just about any sqlite database into a graphql endpoint, including inferring associations',
    },
    {
      header: 'Basic usage',
      content: 'tuql --db path/to/db.sqlite',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
    {
      content: 'Project home: {underline https://github.com/bradleyboy/tuql}',
    },
  ]);
  console.log(usage);
  process.exit();
}
*/

/*
if (options.schema) {
  promise.then(schema => process.stdout.write(printSchema(schema)));
} else {
  const app = express();

  const message = options.infile
    ? `Creating in-memory database with ${options.infile}`
    : `Reading schema from ${options.db}`;

  console.log('');
  console.log(` > ${message}`);

  promise.then(schema => {
    app.use(
      '/graphql',
      cors(),
      graphqlHTTP({
        schema,
        graphiql: options.graphiql,
      })
    );

    app.listen(options.port, () =>
      console.log(` > Running at http://localhost:${options.port}/graphql`)
    );
  });
}
*/

export default getGraphQLSchema;
