import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'Lập trình JavaScript nâng cao' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Khóa học JavaScript từ cơ bản đến nâng cao' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: Difficulty, default: Difficulty.BEGINNER })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
