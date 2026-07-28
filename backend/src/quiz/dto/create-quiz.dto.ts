import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateQuizDto {
  @ApiProperty()
  @IsUUID()
  lessonId: string;

  @ApiProperty({ example: 'Kiểm tra JavaScript cơ bản' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Time limit in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimit?: number;

  @ApiPropertyOptional({ default: 60 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore?: number;
}
