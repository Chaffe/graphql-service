import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from "graphql/index.js";
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import {MemberType, MemberTypeId} from "./member.js";
import {UserType} from "./user.js";
import {UUIDType} from "./uuid.js";
import {PostType} from "./post.js";
import {ProfileType} from "./profile.js";

export const QueryType = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (_, __, context) => context.prisma.memberType.findMany(),
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
      resolve: (_, args, context) => context.prisma.memberType.findUnique({ where: { id: args.id } }),
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (_, __, { prisma, loaders }, info) => {
        const parsedInfo = parseResolveInfo(info);
        if (!parsedInfo) {
          const users = await prisma.user.findMany();
          for (const user of users) {
            loaders.userLoader.prime(user.id, user);
          }
          return users;
        }

        const userFields = parsedInfo.fieldsByTypeName?.User;
        const needUserSubscribedTo = userFields && 'userSubscribedTo' in userFields;
        const needSubscribedToUser = userFields && 'subscribedToUser' in userFields;
        const include: any = {};
        if (needUserSubscribedTo) {
          include.userSubscribedTo = { include: { author: true } };
        }
        if (needSubscribedToUser) {
          include.subscribedToUser = { include: { subscriber: true } };
        }

        const users = await prisma.user.findMany({
          include: Object.keys(include).length ? include : undefined,
        });

        for (const user of users) {
          loaders.userLoader.prime(user.id, user);
          if (needUserSubscribedTo && user.userSubscribedTo) {
            for (const sub of user.userSubscribedTo) {
              loaders.userLoader.prime(sub.author.id, sub.author);
            }
            loaders.userSubscribedToLoader.prime(
              user.id,
              user.userSubscribedTo.map((s) => s.author)
            );
          }

          if (needSubscribedToUser && user.subscribedToUser) {
            for (const sub of user.subscribedToUser) {
              loaders.userLoader.prime(sub.subscriber.id, sub.subscriber);
            }
            loaders.subscribedToUserLoader.prime(
              user.id,
              user.subscribedToUser.map((s) => s.subscriber)
            );
          }
        }
        return users;
      },
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_, args, context) => context.prisma.user.findUnique({ where: { id: args.id } }),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: (_, __, context) => context.prisma.post.findMany(),
    },
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_, args, context) => context.prisma.post.findUnique({ where: { id: args.id } }),
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
      resolve: (_, __, context) => context.prisma.profile.findMany(),
    },
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_, args, context) => context.prisma.profile.findUnique({ where: { id: args.id } }),
    },
  },
});