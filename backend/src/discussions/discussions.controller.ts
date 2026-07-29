import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DiscussionsServiceClass } from './discussions.service';

@ApiTags('Discussions')
@ApiBearerAuth()
@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsServiceClass) {}

  @Get('comments/:lessonId')
  @ApiOperation({ summary: 'Get lesson comments & nested replies' })
  getComments(@Param('lessonId') lessonId: string) {
    return this.discussionsService.getLessonComments(lessonId);
  }

  @Post('comments')
  @ApiOperation({ summary: 'Add a new comment or reply to lesson' })
  addComment(
    @Body() dto: { lessonId: string; content: string; parentId?: string },
    @CurrentUser('sub') userId: string,
  ) {
    return this.discussionsService.addComment(dto.lessonId, userId, dto.content, dto.parentId);
  }

  @Get('reactions/:lessonId')
  @ApiOperation({ summary: 'Get lesson reaction counts and user status' })
  getReactions(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.discussionsService.getLessonReactions(lessonId, userId);
  }

  @Post('reactions/toggle')
  @ApiOperation({ summary: 'Toggle reaction (LIKE, HEART, FIRE, CLAP) for a lesson' })
  toggleReaction(
    @Body() dto: { lessonId: string; type: string },
    @CurrentUser('sub') userId: string,
  ) {
    return this.discussionsService.toggleReaction(dto.lessonId, userId, dto.type);
  }
}
