import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RecommendationsService } from './recommendations.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Recommendations')
@ApiBearerAuth()
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('generate')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Generate AI-powered learning recommendation' })
  generate(@CurrentUser('sub') studentId: string) {
    return this.recommendationsService.generate(studentId);
  }

  @Get('latest')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get latest recommendation' })
  getLatest(@CurrentUser('sub') studentId: string) {
    return this.recommendationsService.getLatest(studentId);
  }

  @Get()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'List recommendation history' })
  findAll(
    @CurrentUser('sub') studentId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.recommendationsService.findAll(studentId, query);
  }
}
