import { getTables } from './getTables';
import initTestDatabase from '../../../testUtils/initTestDatabase';

describe('getTableInfo', () => {
  test('test values', async () => {
    const db = await initTestDatabase();
    const tables = await getTables(db);

    expect(tables.includes('invoices')).toBe(true);
    expect(tables.includes('artists')).toBe(true);
    expect(tables.includes('tracks')).toBe(true);
    expect(tables.includes('playlists')).toBe(true);
    expect(tables.includes('playlist_track')).toBe(true);
  });
});
