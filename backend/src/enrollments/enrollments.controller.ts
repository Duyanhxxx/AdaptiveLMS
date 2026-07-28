import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { EnrollmentsService } from './enrollments.service';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post(':courseId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Enroll into a published course' })
  enroll(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser('sub') studentId: string,
  ) {
    return this.enrollmentsService.enroll(courseId, studentId);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get my enrollments' })
  listMine(@CurrentUser('sub') studentId: string) {
    return this.enrollmentsService.listMine(studentId);
  }

  @Get('students/:studentId')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'List enrollments for a specific student' })
  listForStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.enrollmentsService.listForStudent(
      studentId,
      user.role as Role,
    );
  }
}

