import { Sequelize } from 'sequelize';

export type ColumnInfo = {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string;
  pk: number;
};

export async function getTableInfo(
  tableName: string,
  db: Sequelize
): Promise<ColumnInfo[]> {
  const [info] = await db.query(`PRAGMA table_info("${tableName}")`);
  return info as ColumnInfo[];
}
