import {GraphQLFloat, GraphQLObjectType} from "graphql";
import {GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLString} from "graphql/index.js";
import {UUIDType} from "./uuid.js";
import {PostType} from "./post.js";
import {ProfileType} from "./profile.js";

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: (user, _, context) => context.prisma.profile.findUnique({ where: { userId: user.id } }),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: (user, _, context) => context.prisma.post.findMany({ where: { authorId: user.id } }),
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: (user, _, context) => context.prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: user.id },
        include: { author: true },
      }).then(results => results.map(r => r.author)),
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: (user, _, context) => context.prisma.subscribersOnAuthors.findMany({
        where: { authorId: user.id },
        include: { subscriber: true },
      }).then(results => results.map(r => r.subscriber)),
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});