import { getTableInfo } from './getTableInfo';
import initTestDatabase from '../../../testUtils/initTestDatabase';

describe('getTableInfo', () => {
  test('test values', async () => {
    const db = await initTestDatabase();
    const info = await getTableInfo('tracks', db);

    const pkCol = info.find(i => i.pk === 1);

    expect(pkCol?.name).toBe('TrackId');
    expect(pkCol?.type).toBe('INTEGER');
  });
});
