import { attributeFields } from 'graphql-sequelize';
import { singular } from 'pluralize';
import { GraphQLNonNull } from 'graphql';
import camelcase from 'camelcase';
import { ModelCtor } from 'sequelize/types';

export const getPkFieldKey = (model: ModelCtor<any>) => {
  return Object.keys(model.rawAttributes).find(key => {
    const attr = model.rawAttributes[key];
    return attr.primaryKey;
  });
};

export const makeCreateArgs = (model: ModelCtor<any>) => {
  const fields = attributeFields(model);
  const pk = getPkFieldKey(model);

  delete fields[pk];

  return fields;
};

export const makeUpdateArgs = (model: ModelCtor<any>) => {
  const fields = attributeFields(model);

  return Object.keys(fields).reduce((acc, key) => {
    const field = fields[key];

    if (field.type instanceof GraphQLNonNull) {
      field.type = field.type.ofType;
    }

    acc[key] = field;
    return acc;
  }, fields);
};

export const makeDeleteArgs = (model: ModelCtor<any>) => {
  const fields = attributeFields(model);
  const pk = getPkFieldKey(model);

  if (pk) {
    return { [pk]: fields[pk] };
  } else {
    throw new Error(`Could not find pk | model => ${model.tableName}`);
  }
};

export const getPolyKeys = (
  model: ModelCtor<any>,
  otherModel: ModelCtor<any>
) => {
  const key = getPkFieldKey(model);
  const otherKey = getPkFieldKey(otherModel);

  if (otherKey === key) {
    return [
      key,
      otherKey,
      camelcase(`${singular(otherModel.name)}_${otherKey}`),
    ];
  }

  return [key, otherKey, otherKey];
};

export const makePolyArgs = (
  model: ModelCtor<any>,
  otherModel: ModelCtor<any>
) => {
  const [key, otherKey, otherKeyFormatted] = getPolyKeys(model, otherModel);
  const fields = attributeFields(model);
  const otherFields = attributeFields(otherModel);

  if (key && otherKeyFormatted) {
    return {
      [key]: fields[key],
      [otherKeyFormatted]: otherFields[otherKey],
    };
  } else {
    throw new Error(
      `Could not find keys | ${model.tableName} key => "${key}" - ${otherModel.tableName} otherKeyFormatted => "${otherKeyFormatted}"`
    );
  }
};
