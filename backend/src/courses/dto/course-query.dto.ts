import { ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CourseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Filter by teacher ID' })
  @IsOptional()
  teacherId?: string;
}
