import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

export const createLoaders = (prisma: PrismaClient) => ({
  userLoader: new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...ids] } },
    });
    const usersList = new Map(users.map((user) => [user.id, user]));
    return ids.map((id) => usersList.get(id) || null);
  }),

  postLoader: new DataLoader(async (ids: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { id: { in: [...ids] } },
    });

    const postsList = new Map(posts.map((post) => [post.id, post]));
    return ids.map((id) => postsList.get(id) || null);
  }),

  userPostsLoader: new DataLoader(async (userIds: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: [...userIds] } },
    });
    const postsByUser = new Map<string, any[]>();
    for (const post of posts) {
      if (!postsByUser.has(post.authorId)) {
        postsByUser.set(post.authorId, []);
      }
      postsByUser.get(post.authorId)!.push(post);
    }
    return userIds.map((id) => postsByUser.get(id) || []);
  }),

  profileLoader: new DataLoader(async (ids: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { id: { in: [...ids] } },
    });

    const profilesList = new Map(profiles.map((profile) => [profile.id, profile]));
    return ids.map((id) => profilesList.get(id) || null);
  }),

  profileByUserIdLoader: new DataLoader(async (userIds: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: [...userIds] } },
    });
    const profilesMap = new Map(profiles.map((profile) => [profile.userId, profile]));
    return userIds.map((id) => profilesMap.get(id) || null);
  }),

  memberTypeLoader: new DataLoader(async (ids: readonly string[]) => {
    const memberTypes = await prisma.memberType.findMany({
      where: {
        id: { in: Array.from(ids) },
      },
    });

    const profilesList = new Map(memberTypes.map((memberType) => [memberType.id, memberType]));
    return ids.map((id) => profilesList.get(id) || null);
  }),

  userSubscribedToLoader: new DataLoader(async (ids: readonly string[]) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: [...ids] } },
      include: { author: true },
    });
    return ids.map((userId) =>
      subscriptions.filter((sub) => sub.subscriberId === userId).map((sub) => sub.author),
    );
  }),

  subscribedToUserLoader: new DataLoader(async (ids: readonly string[]) => {
    const subscribers = await prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: [...ids] } },
      include: { subscriber: true },
    });
    return ids.map((userId) =>
      subscribers.filter((sub) => sub.authorId === userId).map((sub) => sub.subscriber),
    );
  }),
});