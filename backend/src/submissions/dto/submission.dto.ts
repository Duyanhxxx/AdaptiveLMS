import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class AnswerItemDto {
  @ApiProperty()
  @IsUUID()
  questionId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answerText: string;
}

export class SubmitAnswersDto {
  @ApiProperty({ type: [AnswerItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];

  @ApiPropertyOptional({ description: 'Time spent in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpent?: number;
}

export class CreateSubmissionDto {
  @ApiProperty()
  @IsUUID()
  quizId: string;
}

export class GradeEssayDto {
  @ApiProperty()
  @IsUUID()
  answerId: string;

  @ApiProperty({ example: 0.8, description: 'Points earned (0 to max)' })
  @Min(0)
  pointsEarned: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}
