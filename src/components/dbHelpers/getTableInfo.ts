import { Sequelize } from 'sequelize/types';

type ColumnInfo = {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string;
  pk: number;
};

async function getTableInfo(
  tableName: string,
  db: Sequelize
): Promise<ColumnInfo[]> {
  const [info] = await db.query(`PRAGMA table_info("${tableName}")`);
  return info as ColumnInfo[];
}

export default getTableInfo;
