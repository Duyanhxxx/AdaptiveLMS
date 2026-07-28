import { Module } from '@nestjs/common';
import { LessonProgressController } from './lesson-progress.controller';
import { LessonProgressService } from './lesson-progress.service';

@Module({
  controllers: [LessonProgressController],
  providers: [LessonProgressService],
  exports: [LessonProgressService],
})
export class LessonProgressModule {}

