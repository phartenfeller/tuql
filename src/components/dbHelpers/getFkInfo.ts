import { Sequelize } from 'sequelize/types';

export type FkInfo = {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  onUpdate: string;
  onDelete: string;
  match: string;
};

export async function getFkInfo(
  tableName: string,
  db: Sequelize
): Promise<FkInfo[]> {
  const foreignKeys = await db.query(`PRAGMA foreign_key_list("${tableName}")`);
  return foreignKeys as FkInfo[];
}
