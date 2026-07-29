import { Controller, Post, Get, Param, Body, Patch, ParseUUIDPipe } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Create an assignment for a lesson' })
  create(
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.assignmentsService.create(dto, user.sub, user.role as Role);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get all assignments for a lesson' })
  findAllByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.assignmentsService.findAllByLesson(lessonId);
  }

  @Get('pending-grading')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all assignment submissions pending grading' })
  getPendingSubmissions(@CurrentUser() user: JwtPayload) {
    return this.assignmentsService.getPendingSubmissions(user.sub, user.role as Role);
  }

  @Patch('submissions/:id/grade')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Grade an assignment submission' })
  gradeSubmission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GradeAssignmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.assignmentsService.gradeSubmission(id, dto, user.sub, user.role as Role);
  }
}
