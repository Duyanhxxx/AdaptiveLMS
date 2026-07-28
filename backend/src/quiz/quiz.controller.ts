import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { QuizService } from './quiz.service';
import { QuizQueryDto } from './dto/quiz-query.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Quiz')
@ApiBearerAuth()
@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('quizzes')
  @ApiOperation({ summary: 'List quizzes with pagination and filters' })
  findAll(@Query() query: QuizQueryDto) {
    return this.quizService.findAll(query);
  }

  @Get('quizzes/:id')
  @ApiOperation({ summary: 'Get quiz by ID with questions' })
  @ApiQuery({ name: 'includeAnswers', required: false, type: Boolean })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeAnswers') includeAnswers?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const canSeeAnswers =
      user?.role === Role.TEACHER || user?.role === Role.ADMIN;
    return this.quizService.findOne(
      id,
      includeAnswers === 'true' && canSeeAnswers,
    );
  }

  @Post('quizzes')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new quiz' })
  create(
    @Body() dto: CreateQuizDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quizService.create(dto, user.sub, user.role as Role);
  }

  @Patch('quizzes/:id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a quiz' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuizDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quizService.update(id, dto, user.sub, user.role as Role);
  }

  @Delete('quizzes/:id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a quiz' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quizService.remove(id, user.sub, user.role as Role);
  }

  @Post('quizzes/:quizId/questions')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Add a question to a quiz' })
  addQuestion(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: CreateQuestionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quizService.addQuestion(quizId, dto, user.sub, user.role as Role);
  }

  @Patch('questions/:id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a question' })
  updateQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quizService.updateQuestion(id, dto, user.sub, user.role as Role);
  }

  @Delete('questions/:id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a question' })
  removeQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quizService.removeQuestion(id, user.sub, user.role as Role);
  }
}
