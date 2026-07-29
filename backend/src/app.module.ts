import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizModule } from './quiz/quiz.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AiModule } from './ai/ai.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { LessonProgressModule } from './lesson-progress/lesson-progress.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { GamificationModule } from './gamification/gamification.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    QuizModule,
    SubmissionsModule,
    AnalyticsModule,
    RecommendationsModule,
    AiModule,
    EnrollmentsModule,
    LessonProgressModule,
    NotificationsModule,
    DiscussionsModule,
    GamificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
