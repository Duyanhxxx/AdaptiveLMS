import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: (dto.type ?? NotificationType.RECOMMENDATION) as NotificationType,
      },
    });
  }

  async broadcast(dto: Omit<CreateNotificationDto, 'userId'>) {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    
    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: dto.title,
        message: dto.message,
        type: (dto.type ?? NotificationType.INFO) as NotificationType,
      })),
    });

    return { message: `Broadcasted to ${users.length} users` };
  }

  async listMine(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async listAll(userId: string | undefined, query: { page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = userId ? { userId } : {};

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return buildPaginatedResult(notifications, total, page, limit);
  }

  async markRead(id: string, userId: string, role: Role) {
    const notif = await this.prisma.notification.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!notif) throw new NotFoundException('Notification not found');

    if (role !== Role.ADMIN && notif.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }
}

