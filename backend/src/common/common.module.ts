import { Module } from '@nestjs/common';
import { CourseAccessService } from './services/course-access.service';

@Module({
  providers: [CourseAccessService],
  exports: [CourseAccessService],
})
export class CommonModule {}
