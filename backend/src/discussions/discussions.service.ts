import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscussionsServiceClass {
  constructor(private readonly prisma: PrismaService) {}

  async getLessonComments(lessonId: string) {
    return this.prisma.comment.findMany({
      where: { lessonId, parentId: null },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
        replies: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addComment(lessonId: string, userId: string, content: string, parentId?: string) {
    return this.prisma.comment.create({
      data: {
        lessonId,
        userId,
        content,
        parentId: parentId || null,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
      },
    });
  }

  async getLessonReactions(lessonId: string, userId: string) {
    const reactions = await this.prisma.lessonReaction.findMany({
      where: { lessonId },
    });

    const counts: Record<string, number> = { LIKE: 0, HEART: 0, FIRE: 0, CLAP: 0 };
    const myReactions = new Set<string>();

    reactions.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
      if (r.userId === userId) myReactions.add(r.type);
    });

    return { counts, myReactions: Array.from(myReactions) };
  }

  async toggleReaction(lessonId: string, userId: string, type: string) {
    const existing = await this.prisma.lessonReaction.findUnique({
      where: { lessonId_userId_type: { lessonId, userId, type } },
    });

    if (existing) {
      await this.prisma.lessonReaction.delete({
        where: { id: existing.id },
      });
      return { action: 'removed', type };
    } else {
      await this.prisma.lessonReaction.create({
        data: { lessonId, userId, type },
      });
      return { action: 'added', type };
    }
  }
}
