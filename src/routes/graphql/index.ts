import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {graphql, GraphQLSchema, parse, validate,} from 'graphql';
import {QueryType} from "./types/query-type.js";
import {MutationType} from "./types/mutation-type.js";
import depthLimit from "graphql-depth-limit";
import { createLoaders } from "./data-loaders/loaders.js";

const schema = new GraphQLSchema({ query: QueryType, mutation: MutationType });

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const errors = validate(schema, parse(query), [depthLimit(5)]);
      if (errors.length) {
        return { errors };
      }

      const loaders = createLoaders(prisma);

      const contextValue = {
        prisma,
        loaders,
      };

      return await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue,
      });
    },
  });
};

export default plugin;
