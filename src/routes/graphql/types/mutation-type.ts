import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from "graphql/index.js";
import {ChangeUserInput, CreateUserInput, UserType} from "./user.js";
import {ChangeProfileInput, CreateProfileInput, ProfileType} from "./profile.js";
import {ChangePostInput, CreatePostInput, PostType} from "./post.js";
import {UUIDType} from "./uuid.js";

export const MutationType = new GraphQLObjectType({
  name: 'MutationType',
  fields: {
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: async (_, args, context) => await context.prisma.user.create({ data: args.dto }),
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: async (_, args, context) => await context.prisma.profile.create({ data: args.dto }),
    },
    createPost: {
      type: new GraphQLNonNull(PostType),
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: async (_, args, context) => await context.prisma.post.create({ data: args.dto }),
    },
    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: new GraphQLNonNull(ChangeUserInput) } },
      resolve: async (_, args, context) => await context.prisma.user.update({ where: { id: args.id }, data: args.dto }),
    },
    changeProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: new GraphQLNonNull(ChangeProfileInput) } },
      resolve: async (_, args, context) => await context.prisma.profile.update({ where: { id: args.id }, data: args.dto }),
    },
    changePost: {
      type: new GraphQLNonNull(PostType),
      args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: new GraphQLNonNull(ChangePostInput) } },
      resolve: async (_, args, context) => await context.prisma.post.update({ where: { id: args.id }, data: args.dto }),
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, context) => {
        await context.prisma.user.delete({ where: { id: args.id } });
        return 'success';
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, context) => {
        await context.prisma.profile.delete({ where: { id: args.id } });
        return 'success';
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, context) => {
        await context.prisma.post.delete({ where: { id: args.id } });
        return 'success';
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: { userId: { type: new GraphQLNonNull(UUIDType) }, authorId: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, context) => {
        await context.prisma.subscribersOnAuthors.create({
          data: { subscriberId: args.userId, authorId: args.authorId },
        });
        return 'success';
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: { userId: { type: new GraphQLNonNull(UUIDType) }, authorId: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, context) => {
        await context.prisma.subscribersOnAuthors.delete({
          where: { subscriberId_authorId: { subscriberId: args.userId, authorId: args.authorId } },
        });
        return 'success';
      },
    },
  },
});