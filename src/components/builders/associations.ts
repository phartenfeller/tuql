import { plural, singular } from 'pluralize';
import { FkInfo } from 'src/components/dbHelpers/getFkInfo';
import { ColumnInfo } from 'src/components/dbHelpers/getTableInfo';
import { formatFieldName } from '../../utils';

const FK_SUFFIX_REGEX = /(_id|Id)$/;

const formJoinTableAssociations = (a, b, aKey, bKey, table) => {
  return [
    {
      from: a,
      to: b,
      type: 'belongsToMany',
      options: {
        through: table,
        foreignKey: aKey,
        timestamps: false,
      },
    },
    {
      from: b,
      to: a,
      type: 'belongsToMany',
      options: {
        through: table,
        foreignKey: bKey,
        timestamps: false,
      },
    },
  ];
};

const joinTableFromForeignKeys = (table, foreignKeys) => {
  const [{ table: a, from: aKey }, { table: b, from: bKey }] = foreignKeys;
  return formJoinTableAssociations(a, b, aKey, bKey, table);
};

export const joinTableAssociations = (
  table: string,
  info: ColumnInfo[],
  foreignKeys: FkInfo[]
) => {
  if (foreignKeys.length) {
    return joinTableFromForeignKeys(table, foreignKeys);
  }

  const [a, b] = table.split('_').map(plural);
  const keys = info.map(column => column.name);
  const [aKey] = keys.filter(key => key.indexOf(singular(a)) === 0);
  const [bKey] = keys.filter(key => key.indexOf(singular(b)) === 0);

  return formJoinTableAssociations(a, b, aKey, bKey, table);
};

export type TabAssociation = {
  from: string;
  to: string;
  type: string;
  options?: {
    foreignKey?: string;
  };
};

export const tableAssociations = (
  table: string,
  info: ColumnInfo[],
  foreignKeys: FkInfo[]
): TabAssociation[] => {
  const associations: TabAssociation[] = [];
  const fkColumns = foreignKeys.map(({ from }) => from);

  foreignKeys.forEach(({ table: otherTable, from }) => {
    associations.push({
      from: otherTable,
      to: table,
      type: 'hasMany',
      options: {
        foreignKey: formatFieldName(from),
      },
    });

    associations.push({
      from: table,
      to: otherTable,
      type: 'belongsTo',
      options: {
        foreignKey: formatFieldName(from),
      },
    });
  });

  info
    .filter(({ name, pk }) => !pk && !fkColumns.includes(name))
    .filter(({ name }) => {
      return FK_SUFFIX_REGEX.test(name);
    })
    .forEach(column => {
      const root = column.name.replace(FK_SUFFIX_REGEX, '');

      associations.push({
        from: plural(root),
        to: table,
        type: 'hasMany',
        options: {
          foreignKey: formatFieldName(column.name),
        },
      });

      associations.push({
        from: table,
        to: plural(root),
        type: 'belongsTo',
        options: {
          foreignKey: formatFieldName(column.name),
        },
      });
    });

  return associations;
};
