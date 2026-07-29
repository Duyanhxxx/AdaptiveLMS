import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AiService } from './ai.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-quiz')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Generate quiz questions using AI' })
  generateQuiz(@Body() body: { topic: string; description: string; count?: number }) {
    return this.aiService.generateQuiz(body.topic, body.description, body.count);
  }

  @Post('generate-assignment')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Generate assignment using AI' })
  generateAssignment(@Body() body: { topic: string }) {
    return this.aiService.generateAssignment(body.topic);
  }
}
