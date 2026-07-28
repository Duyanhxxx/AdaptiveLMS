import { Controller, Get, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { UserCacheInterceptor } from '../common/interceptors/user-cache.interceptor';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseInterceptors(UserCacheInterceptor)
@CacheTTL(60000) // Cache for 60 seconds
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('student/dashboard')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Student dashboard with progress and performance' })
  getStudentDashboard(@CurrentUser('sub') studentId: string) {
    return this.analyticsService.getStudentDashboard(studentId);
  }

  @Get('student/:id/dashboard')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'View a student dashboard (teacher/admin)' })
  getStudentDashboardById(@Param('id', ParseUUIDPipe) studentId: string) {
    return this.analyticsService.getStudentDashboard(studentId);
  }

  @Get('student/progress')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Detailed learning progress for current student' })
  getMyProgress(@CurrentUser('sub') studentId: string) {
    return this.analyticsService.getLearningProgress(studentId);
  }

  @Get('teacher/dashboard')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Teacher dashboard with class analytics' })
  getTeacherDashboard(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getTeacherDashboard(user.sub);
  }

  @Get('teacher/student-groups')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Detailed student groups with scores and progress' })
  getTeacherStudentGroups(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getTeacherStudentGroups(user.sub);
  }

  @Get('admin/dashboard')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin dashboard with platform analytics' })
  getAdminDashboard() {
    return this.analyticsService.getAdminDashboard();
  }
}
