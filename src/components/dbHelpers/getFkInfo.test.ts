import { getFkInfo } from './getFkInfo';
import initTestDatabase from '../../../testUtils/initTestDatabase';

describe('getFkInfo', () => {
  test('test values', async () => {
    const db = await initTestDatabase();
    const info = await getFkInfo('tracks', db);

    const firstFk = info.find(i => i.id === 0);

    expect(firstFk?.table).toBe('media_types');
    expect(firstFk?.to).toBe('MediaTypeId');
  });
});
