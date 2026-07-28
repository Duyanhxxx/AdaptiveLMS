import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LessonProgressDto } from './dto/lesson-progress.dto';
import { LessonProgressService } from './lesson-progress.service';

@ApiTags('Lesson Progress')
@ApiBearerAuth()
@Controller('lesson-progress')
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  @Post(':lessonId/viewed')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Mark lesson as viewed' })
  viewed(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() dto: LessonProgressDto,
    @CurrentUser('sub') studentId: string,
  ) {
    return this.lessonProgressService.markViewed(lessonId, studentId, dto);
  }

  @Post(':lessonId/completed')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Mark lesson as completed' })
  completed(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() dto: LessonProgressDto,
    @CurrentUser('sub') studentId: string,
  ) {
    return this.lessonProgressService.markCompleted(lessonId, studentId, dto);
  }

  @Get('course/:courseId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get lesson completion progress for a course' })
  getCourseProgress(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser('sub') studentId: string,
  ) {
    return this.lessonProgressService.getCourseProgress(courseId, studentId);
  }
}

