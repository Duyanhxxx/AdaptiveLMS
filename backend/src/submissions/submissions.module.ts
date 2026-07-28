import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { GradingEngine } from './grading.engine';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AiModule, NotificationsModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, GradingEngine],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
