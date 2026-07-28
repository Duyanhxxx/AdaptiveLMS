import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiProperty({ example: 'Giới thiệu về JavaScript ES6' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Nội dung bài học...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ default: 30, description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
