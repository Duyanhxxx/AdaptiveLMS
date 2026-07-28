import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SubmissionsService } from './submissions.service';
import { SubmissionQueryDto } from './dto/submission-query.dto';
import {
  CreateSubmissionDto,
  GradeEssayDto,
  SubmitAnswersDto,
} from './dto/submission.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Start a new quiz submission' })
  create(
    @Body() dto: CreateSubmissionDto,
    @CurrentUser('sub') studentId: string,
  ) {
    return this.submissionsService.create(dto, studentId);
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit answers for grading' })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitAnswersDto,
    @CurrentUser('sub') studentId: string,
  ) {
    return this.submissionsService.submit(id, dto, studentId);
  }

  @Post('grade-essay')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Manually grade an essay answer' })
  gradeEssay(
    @Body() dto: GradeEssayDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.submissionsService.gradeEssay(dto, user.sub, user.role as Role);
  }

  @Post('suggest-grade/:answerId')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'AI-suggest essay grade with rubric' })
  suggestGrade(
    @Param('answerId', ParseUUIDPipe) answerId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.submissionsService.suggestEssayGrade(
      answerId,
      user.sub,
      user.role as Role,
    );
  }

  @Get('pending-count')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Count submissions pending essay grading' })
  pendingCount(@CurrentUser() user: JwtPayload) {
    return this.submissionsService.getPendingGradingCount(
      user.sub,
      user.role as Role,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List submissions with pagination' })
  findAll(
    @Query() query: SubmissionQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.submissionsService.findAll(query, user.sub, user.role as Role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get submission details' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.submissionsService.findOne(id, user.sub, user.role as Role);
  }
}
