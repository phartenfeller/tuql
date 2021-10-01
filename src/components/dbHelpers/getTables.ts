import { QueryTypes, Sequelize } from 'sequelize';

type TableRows = {
  name: string;
};

export async function getTables(db: Sequelize) {
  const rows: TableRows[] = await db.query(
    'SELECT name FROM sqlite_master WHERE type = "table" AND name NOT LIKE "sqlite_%"',
    { type: QueryTypes.SELECT }
  );

  const tables = rows.map(({ name }) => name);

  return tables;
}
