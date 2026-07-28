import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ example: 'JavaScript là ngôn ngữ lập trình gì?' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ enum: QuestionType, default: QuestionType.MULTIPLE_CHOICE })
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @ApiPropertyOptional({
    example: ['Compiled', 'Interpreted', 'Assembly', 'Machine'],
    description: 'Options for multiple choice questions',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ example: 'Interpreted' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: 'JavaScript Basics' })
  @IsOptional()
  @IsString()
  topic?: string;
}
