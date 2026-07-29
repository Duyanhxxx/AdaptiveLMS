import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('my-badges')
  async getMyBadges(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getUserBadges(user.sub);
  }

  @Get('my-certificates')
  async getMyCertificates(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getUserCertificates(user.sub);
  }

  @Post('award-badge')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async awardBadge(@Body() body: { userId: string; badgeId: string }) {
    return this.gamificationService.awardBadgeToUser(body.userId, body.badgeId);
  }
}
