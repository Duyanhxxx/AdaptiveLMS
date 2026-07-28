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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { LessonsService } from './lessons.service';
import { LessonQueryDto } from './dto/lesson-query.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Lessons')
@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'List lessons with pagination and filters' })
  findAll(
    @Query() query: LessonQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonsService.findAll(query, user.role as Role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonsService.findOne(id, user.role as Role);
  }

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new lesson' })
  create(
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonsService.create(dto, user.sub, user.role as Role);
  }

  @Patch('reorder')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Reorder lessons in a course' })
  reorder(
    @Body() dto: ReorderLessonsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonsService.reorder(dto, user.sub, user.role as Role);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a lesson' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonsService.update(id, dto, user.sub, user.role as Role);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a lesson' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonsService.remove(id, user.sub, user.role as Role);
  }
}
