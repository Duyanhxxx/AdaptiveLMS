import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Target user ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'Bài học mới được đề xuất' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Hệ thống AI đã tạo lộ trình học tập mới...' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.RECOMMENDATION })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class BroadcastNotificationDto extends OmitType(CreateNotificationDto, ['userId'] as const) {}

