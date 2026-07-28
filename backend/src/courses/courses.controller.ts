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
import { CoursesService } from './courses.service';
import { CourseQueryDto } from './dto/course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List courses with pagination, search, and filters' })
  findAll(
    @Query() query: CourseQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.findAll(query, user.role as Role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID with lessons' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.findOne(id, user.role as Role);
  }

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new course' })
  create(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.create(dto, user.sub, user.role as Role);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a course' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.update(id, dto, user.sub, user.role as Role);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a course' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.remove(id, user.sub, user.role as Role);
  }
}
