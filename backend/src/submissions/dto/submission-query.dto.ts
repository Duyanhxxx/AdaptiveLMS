import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class SubmissionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  quizId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: SubmissionStatus })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;
}
