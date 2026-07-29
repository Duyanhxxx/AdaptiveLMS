import { Module } from '@nestjs/common';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsServiceClass } from './discussions.service';

@Module({
  controllers: [DiscussionsController],
  providers: [DiscussionsServiceClass],
  exports: [DiscussionsServiceClass],
})
export class DiscussionsModule {}
