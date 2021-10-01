import fs from 'fs';
import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';
import {
  attributeFields,
  defaultArgs,
  defaultListArgs,
  resolver,
} from 'graphql-sequelize';
import pluralize, { singular } from 'pluralize';
import { Sequelize, ModelCtor } from 'sequelize';
import { getFkInfo, getTableInfo, getTables } from '../dbHelpers';
import {
  findModelKey,
  formatFieldName,
  formatTypeName,
  isJoinTable,
  pascalCase,
} from '../../utils';
import {
  getPkFieldKey,
  getPolyKeys,
  makeCreateArgs,
  makeDeleteArgs,
  makePolyArgs,
  makeUpdateArgs,
} from './arguments';
import {
  joinTableAssociations,
  TabAssociation,
  tableAssociations,
} from './associations';
import createDefinitions from './definitions';
import sqlite3 from 'sqlite3';
import { MutationParams } from 'src/types/MutationParams';
import getMutationOptions from './util/getMutationOptions';

const GenericResponseType = new GraphQLObjectType({
  name: 'GenericResponse',
  fields: {
    success: { type: GraphQLBoolean },
  },
});

type buildSchemaParams = {
  databaseFile: string;
  mutations: MutationParams;
};

export const buildSchemaFromDatabase = ({
  databaseFile,
  mutations,
}: buildSchemaParams): Promise<GraphQLSchema> => {
  return new Promise(async (resolve, reject) => {
    const db = new Sequelize({
      dialect: 'sqlite',
      dialectModule: sqlite3,
      storage: databaseFile,
      logging: false,
    });

    resolve(await build({ db, mutations }));
  });
};

// export const buildSchemaFromInfile = infile => {
//   return new Promise(async (resolve, reject) => {
//     const db = new Sequelize({
//       dialect: 'sqlite',
//       dialectModule: sqlite3,
//       storage: ':memory:',
//       logging: false,
//     });

//     const contents = fs.readFileSync(infile);
//     const statements = contents
//       .toString()
//       .split(/;(\r?\n|\r)/g)
//       .filter(s => s.trim().length);

//     for (let stmt of statements) {
//       await db.query(stmt);
//     }

//     resolve(await build(db));
//   });
// };

type Models = {
  [key: string]: ModelCtor<any>;
};

type buildParams = {
  db: Sequelize;
  mutations: MutationParams;
};

const build = ({ db, mutations }: buildParams): Promise<GraphQLSchema> => {
  const mutationOptions = getMutationOptions(mutations);

  return new Promise(async (resolve, reject) => {
    const models: Models = {};
    let associations: TabAssociation[] = [];

    const tables = await getTables(db);

    for (let table of tables) {
      const tableInfo = await getTableInfo(table, db);
      const foreignKeys = await getFkInfo(table, db);

      if (isJoinTable(table, tables)) {
        associations = associations.concat(
          joinTableAssociations(table, tableInfo, foreignKeys)
        );
      } else {
        models[table] = db.define(table, createDefinitions(tableInfo), {
          timestamps: false,
          tableName: table,
        });

        associations = associations.concat(
          tableAssociations(table, tableInfo, foreignKeys)
        );
      }
    }

    associations.forEach(({ from, to, type, options }) => {
      const key = type === 'belongsTo' ? singular(to) : to;
      const fromKey = findModelKey(from, models);
      const toKey = findModelKey(to, models);
      models[fromKey][key] = models[fromKey][type](models[toKey], options);
    });

    const types = {};
    const mutations = {};
    const queries = {};

    Object.keys(models).forEach(key => {
      const model = models[key];
      const fieldAssociations = {
        hasMany: associations
          .filter(({ type }) => type === 'hasMany')
          .filter(({ from }) => from === key)
          .map(({ to }) => models[to]),
        belongsTo: associations
          .filter(({ type }) => type === 'belongsTo')
          .filter(({ from }) => from === key)
          .map(({ to }) => models[to]),
        belongsToMany: associations
          .filter(({ type }) => type === 'belongsToMany')
          .map(({ from, to }) => [from, to])
          .filter((sides: string[]) => sides.includes(key)),
      };

      const type = new GraphQLObjectType({
        name: formatTypeName(model.name),
        fields() {
          const fields = attributeFields(model);

          fieldAssociations.hasMany.forEach(associatedModel => {
            fields[formatFieldName(associatedModel.name)] = {
              type: new GraphQLList(types[associatedModel.name]),
              args: defaultListArgs(model[associatedModel.name]),
              resolve: resolver(model[associatedModel.name]),
            };
          });

          fieldAssociations.belongsTo.forEach(associatedModel => {
            const fieldName = singular(associatedModel.name);
            fields[formatFieldName(fieldName)] = {
              type: types[associatedModel.name],
              resolve: resolver(model[fieldName]),
            };
          });

          fieldAssociations.belongsToMany.forEach(sides => {
            const [other] = sides.filter(side => side !== model.name);
            fields[formatFieldName(other)] = {
              type: new GraphQLList(types[other]),
              resolve: resolver(model[other]),
            };
          });

          return fields;
        },
      });

      types[key] = type;

      queries[pluralize(formatFieldName(key))] = {
        type: new GraphQLList(type),
        args: defaultListArgs(model),
        resolve: resolver(model),
      };

      queries[singular(formatFieldName(key))] = {
        type,
        args: defaultArgs(model),
        resolve: resolver(model),
      };

      if (mutationOptions.create) {
        mutations[`create${type}`] = {
          type,
          args: makeCreateArgs(model),
          resolve: async (obj, values, info) => {
            const options = {
              // By default sequelize will insert all columns which can cause a
              // bug where default values, that use functions, defined at the
              // database layer don't get populated correctly.
              fields: Object.keys(values),
            };
            const thing = await model.create(values, options);
            return thing;
          },
        };
      }

      const pkKey = getPkFieldKey(model);

      if (mutationOptions.update) {
        if (pkKey) {
          mutations[`update${type}`] = {
            type,
            args: makeUpdateArgs(model),
            resolve: async (obj, values, info) => {
              const thing = await model.findOne({
                where: { [pkKey]: values[pkKey] },
              });

              await thing.update(values);

              return thing;
            },
          };
        }
      }

      if (mutationOptions.delete) {
        mutations[`delete${type}`] = {
          type: GenericResponseType,
          args: makeDeleteArgs(model),
          resolve: async (obj, values, info) => {
            const thing = await model.findOne({
              where: values,
            });

            await thing.destroy();

            return {
              success: true,
            };
          },
        };
      }

      if (pkKey) {
        fieldAssociations.belongsToMany.forEach(sides => {
          const [other] = sides.filter(side => side !== model.name);
          const nameBits = [formatTypeName(model.name), formatTypeName(other)];

          let options: string[] = [];

          if (mutationOptions.create) {
            options.push(`add`);
          }
          if (mutationOptions.delete) {
            options.push(`remove`);
          }

          options.forEach(prefix => {
            const connector = prefix === 'add' ? 'To' : 'From';
            const name = `${prefix}${nameBits.join(connector)}`;
            mutations[name] = {
              type: GenericResponseType,
              args: makePolyArgs(model, models[other]),
              resolve: async (obj, values: object, info) => {
                const [, , otherArgumentKey] = getPolyKeys(
                  model,
                  models[other]
                );

                if (otherArgumentKey) {
                  const thingOne = await model.findByPk(values[pkKey]);
                  const thingTwo = await models[other].findByPk(
                    values[otherArgumentKey]
                  );

                  const method = `${prefix}${pascalCase(singular(other))}`;

                  await thingOne[method](thingTwo);

                  return {
                    success: true,
                  };
                } else {
                  console.error('No otherArgumentKey!');
                  return {
                    success: false,
                  };
                }
              },
            };
          });
        });
      }
    });

    console.log('queries => ', JSON.stringify(queries));

    const query = new GraphQLObjectType({
      name: 'Query',
      fields: queries,
    });

    console.log('mutations => ', JSON.stringify(mutations));

    const mutation =
      Object.keys(mutations).length === 0
        ? null
        : new GraphQLObjectType({
            name: 'Mutation',
            fields: mutations,
          });

    resolve(
      new GraphQLSchema({
        query,
        mutation,
      })
    );
  });
};
