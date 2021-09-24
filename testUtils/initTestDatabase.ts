import { rejects } from 'assert';
import { Sequelize } from 'sequelize';

function initTestDatabase(): Promise<Sequelize> {
  return new Promise((resolve, reject) => {
    resolve(
      new Sequelize({
        dialect: 'sqlite',
        storage: './testUtils/chinook.db',
        logging: false,
      })
    );
  });
}

export default initTestDatabase;
