import getTableInfo from './getTableInfo';
import initTestDatabase from '../../../testUtils/initTestDatabase';

describe('getTableInfo', () => {
  test('return type', async () => {
    const db = await initTestDatabase();
    const info = await getTableInfo('tracks', db);

    console.log('info', info);
    expect(info).toBeInstanceOf(Object);
  });
});
