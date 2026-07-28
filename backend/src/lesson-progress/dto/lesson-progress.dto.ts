import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class LessonProgressDto {
  @ApiPropertyOptional({
    description: 'Time spent in seconds (optional)',
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}

