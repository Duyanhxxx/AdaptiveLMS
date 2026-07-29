import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getUserBadges(userId: string) {
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
    
    // Also return all available badges to show locked ones if needed
    const allBadges = await this.prisma.badge.findMany();
    
    return {
      earned: userBadges,
      all: allBadges,
    };
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async awardBadgeToUser(userId: string, badgeId: string) {
    // Check if user already has it
    const existing = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeId: { userId, badgeId }
      }
    });

    if (existing) {
      return existing;
    }

    return this.prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
      include: { badge: true }
    });
  }
}
