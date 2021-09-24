import initGraphQLServer from '../index';
import express from 'express';

const app = express();

initGraphQLServer({
  filePath: './testUtils/chinook.db',
  mutation: false,
  expressApp: app,
});
