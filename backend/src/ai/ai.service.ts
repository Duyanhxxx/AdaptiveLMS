import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AiRecommendationInput,
  AiRecommendationOutput,
} from './types/recommendation.types';
import {
  EssayGradingInput,
  EssayGradingOutput,
} from './types/grading.types';
import { getGroupMeta } from '../common/utils/student-group.util';
import { AI_PROMPTS } from './constants/prompts.constant';
import { AiRecommendationSchema, EssayGradingSchema } from './schemas/ai-response.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI | null;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.modelName = this.configService.get<string>(
      'GEMINI_MODEL',
      'gemini-1.5-flash',
    );
    this.genAI = apiKey && apiKey !== 'your-gemini-api-key'
      ? new GoogleGenerativeAI(apiKey)
      : null;
  }

  async generateRecommendation(
    input: AiRecommendationInput,
  ): Promise<AiRecommendationOutput> {
    if (!this.genAI) {
      this.logger.warn('Gemini API key not configured — using rule-based fallback');
      return this.buildFallbackRecommendation(input);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const prompt = this.buildPrompt(input);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return this.parseAiResponse(text, input);
    } catch (error) {
      this.logGeminiError(error);
      return this.buildFallbackRecommendation(input);
    }
  }

  async suggestEssayGrade(input: EssayGradingInput): Promise<EssayGradingOutput> {
    if (!this.genAI) {
      return this.buildFallbackEssayGrade(input);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const prompt = this.buildEssayGradingPrompt(input);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return this.parseEssayGradingResponse(text, input);
    } catch (error) {
      this.logGeminiError(error);
      return this.buildFallbackEssayGrade(input);
    }
  }

  private logGeminiError(error: unknown) {
    const status = (error as { status?: number })?.status;
    const message = error instanceof Error ? error.message : String(error);

    if (status === 429) {
      this.logger.warn(
        `Gemini quota exceeded (${this.modelName}) — using rule-based fallback. ` +
          'Wait a minute or switch GEMINI_MODEL in .env.',
      );
      return;
    }

    this.logger.warn(`Gemini API unavailable — using rule-based fallback: ${message}`);
  }

  private buildPrompt(input: AiRecommendationInput): string {
    const lessons = input.availableLessons.map((l) => ({
      id: l.id,
      title: l.title,
      difficulty: l.difficulty,
      topics: l.topics,
    }));
    const groupMeta = getGroupMeta(input.studentGroup);
    return AI_PROMPTS.RECOMMENDATION(input, JSON.stringify(lessons), groupMeta.label);
  }

  private sanitizeText(text: string): string {
    return text
      .replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '',
      )
      .replace(/\(ID:\s*[`'"]?[`'"]?\)/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private parseAiResponse(
    text: string,
    input: AiRecommendationInput,
  ): AiRecommendationOutput {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
      parsed = AiRecommendationSchema.parse(parsed);
    } catch (e) {
      this.logger.error('Zod parsing failed for Recommendation, using fallback', e);
      return this.buildFallbackRecommendation(input);
    }

    const validIds = new Set(input.availableLessons.map((l) => l.id));
    parsed.recommendedLessonIds = (parsed.recommendedLessonIds ?? []).filter(
      (id: string) => validIds.has(id),
    );

    if (parsed.recommendedLessonIds.length === 0) {
      parsed.recommendedLessonIds = input.availableLessons
        .slice(0, 3)
        .map((l) => l.id);
    }

    parsed.explanation = this.sanitizeText(parsed.explanation ?? '');
    parsed.motivationalFeedback = this.sanitizeText(
      parsed.motivationalFeedback ?? '',
    );

    if (parsed.explanation.length > 400) {
      parsed.explanation = parsed.explanation.slice(0, 397) + '...';
    }

    parsed.studentGroup = input.studentGroup;
    parsed.groupStrategy =
      parsed.groupStrategy ?? getGroupMeta(input.studentGroup).description;

    return parsed;
  }

  private filterLessonsByGroup(
    lessons: AiRecommendationInput['availableLessons'],
    group: AiRecommendationInput['studentGroup'],
  ) {
    const byDifficulty = (diff: string) =>
      lessons.filter((l) => l.difficulty === diff);

    if (group === 'EXCELLENT') {
      const advanced = byDifficulty('ADVANCED');
      return advanced.length > 0 ? advanced : lessons.slice(-5);
    }
    if (group === 'NEEDS_SUPPORT') {
      const beginner = byDifficulty('BEGINNER');
      return beginner.length > 0 ? beginner : lessons.slice(0, 5);
    }
    const intermediate = byDifficulty('INTERMEDIATE');
    return intermediate.length > 0 ? intermediate : lessons.slice(2, 7);
  }

  private buildFallbackRecommendation(
    input: AiRecommendationInput,
  ): AiRecommendationOutput {
    const level = this.inferLevel(input.averageScore);
    const groupMeta = getGroupMeta(input.studentGroup);
    const filteredLessons = this.filterLessonsByGroup(
      input.availableLessons,
      input.studentGroup,
    );

    const weaknesses =
      input.weakTopics.length > 0
        ? input.weakTopics
        : ['Cần luyện tập thêm các chủ đề cơ bản'];
    const strengths =
      input.strongTopics.length > 0
        ? input.strongTopics
        : ['Đang xây dựng nền tảng kiến thức'];

    const recommended = filteredLessons
      .filter((l) => l.topics.some((t) => weaknesses.includes(t)))
      .slice(0, 3);

    const lessonIds =
      recommended.length > 0
        ? recommended.map((l) => l.id)
        : filteredLessons.slice(0, 3).map((l) => l.id);

    const groupPlans: Record<
      AiRecommendationInput['studentGroup'],
      { daily: string[]; weekly: string[] }
    > = {
      EXCELLENT: {
        daily: [
          'Thử thách: 1 bài nâng cao ngoài chương trình',
          'Ôn tập nhanh 15 phút chủ đề đã thuộc',
        ],
        weekly: [
          'Hoàn thành 2 bài học ADVANCED',
          'Giúp đỡ 1 bạn cùng lớp (peer teaching)',
        ],
      },
      AVERAGE: {
        daily: [
          `Ôn tập 25 phút chủ đề: ${weaknesses[0]}`,
          'Làm 5 câu hỏi luyện tập',
        ],
        weekly: [
          `Hoàn thành ${lessonIds.length} bài học được đề xuất`,
          '1 bài quiz thử thách để bứt phá điểm số',
        ],
      },
      NEEDS_SUPPORT: {
        daily: [
          'Học 15 phút bài cơ bản, không áp lực',
          'Ghi chú 3 ý chính đã hiểu',
        ],
        weekly: [
          'Hoàn thành 1 bài học BEGINNER',
          'Luyện lại quiz cũ để củng cố',
        ],
      },
    };

    const plan = groupPlans[input.studentGroup];

    return {
      learningLevel: level,
      studentGroup: input.studentGroup,
      groupStrategy: groupMeta.description,
      strengths,
      weaknesses,
      recommendedLessonIds: lessonIds,
      practicePlan: {
        daily: plan.daily,
        weekly: plan.weekly,
        focusAreas: weaknesses.slice(0, 3),
      },
      motivationalFeedback: this.buildMotivation(
        input.studentName,
        input.averageScore,
        input.studentGroup,
      ),
      explanation: this.buildExplanation(input, level, lessonIds.length, groupMeta.label),
    };
  }

  private inferLevel(
    score: number,
  ): AiRecommendationOutput['learningLevel'] {
    if (score >= 85) return 'EXPERT';
    if (score >= 70) return 'ADVANCED';
    if (score >= 50) return 'INTERMEDIATE';
    return 'BEGINNER';
  }

  private buildMotivation(
    name: string,
    score: number,
    group: AiRecommendationInput['studentGroup'],
  ): string {
    if (group === 'EXCELLENT') {
      return `${name}, bạn thuộc nhóm xuất sắc với ${score.toFixed(0)}%! Hãy thử thách bản thân với các bài học nâng cao — đừng để chương trình quá dễ làm bạn nản.`;
    }
    if (group === 'NEEDS_SUPPORT') {
      return `${name}, mỗi bước nhỏ đều quan trọng. Bạn đang xây nền tảng vững chắc — hãy học theo nhịp của mình, đừng so sánh với người khác.`;
    }
    return `${name}, bạn đang ở nhóm trung bình với ${score.toFixed(0)}% — rất gần bước đột phá! Tập trung vào 1-2 chủ đề yếu mỗi tuần sẽ giúp bạn vươn lên.`;
  }

  private buildExplanation(
    input: AiRecommendationInput,
    level: string,
    lessonCount: number,
    groupLabel: string,
  ): string {
    return (
      `Bạn thuộc ${groupLabel} với trình độ ${level}. ` +
      `Dựa trên điểm trung bình ${input.averageScore.toFixed(0)}%, ` +
      `${input.weakTopics.length > 0 ? `cần cải thiện: ${input.weakTopics.join(', ')}. ` : ''}` +
      `Chúng tôi đề xuất ${lessonCount} bài học phù hợp với nhóm của bạn.`
    );
  }

  private buildEssayGradingPrompt(input: EssayGradingInput): string {
    const groupMeta = getGroupMeta(input.studentGroup);
    const rubric = input.rubric ?? this.defaultRubric();
    return AI_PROMPTS.ESSAY_GRADING(input, groupMeta, rubric);
  }

  private defaultRubric(): string {
    return `1. Nội dung (40%): Đúng ý, đủ ý, liên quan câu hỏi
2. Cấu trúc (30%): Mạch lạc, có đầu-giữa-cuối
3. Ngôn ngữ (30%): Rõ ràng, chính xác thuật ngữ`;
  }

  private parseEssayGradingResponse(
    text: string,
    input: EssayGradingInput,
  ): EssayGradingOutput {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
      parsed = EssayGradingSchema.parse(parsed);
    } catch (e) {
      this.logger.error('Zod parsing failed for EssayGrading, using fallback', e);
      return this.buildFallbackEssayGrade(input);
    }

    parsed.suggestedPoints = Math.min(
      Math.max(0, parsed.suggestedPoints ?? 0),
      input.maxPoints,
    );
    parsed.feedback = this.sanitizeText(parsed.feedback ?? '');
    parsed.explanation = this.sanitizeText(parsed.explanation ?? '');

    return parsed;
  }

  private buildFallbackEssayGrade(input: EssayGradingInput): EssayGradingOutput {
    const answerLen = input.studentAnswer.trim().length;
    const groupMeta = getGroupMeta(input.studentGroup);

    let ratio = 0.3;
    if (answerLen > 200) ratio = 0.6;
    if (answerLen > 500) ratio = 0.75;
    if (answerLen > 800) ratio = 0.85;

    const contentPts = Math.round(input.maxPoints * 0.4 * ratio);
    const structurePts = Math.round(input.maxPoints * 0.3 * ratio);
    const languagePts = Math.round(input.maxPoints * 0.3 * ratio);
    const suggestedPoints = contentPts + structurePts + languagePts;

    const toneByGroup: Record<string, string> = {
      EXCELLENT:
        'Bài làm thể hiện hiểu biết tốt. Hãy thử mở rộng thêm ví dụ và phân tích sâu hơn.',
      AVERAGE:
        'Bạn đã nắm được ý chính. Tập trung cải thiện cấu trúc và làm rõ hơn các luận điểm.',
      NEEDS_SUPPORT:
        'Bạn đã cố gắng trả lời! Hãy bắt đầu bằng việc liệt kê ý chính, sau đó giải thích từng ý một cách đơn giản.',
    };

    return {
      suggestedPoints,
      feedback: toneByGroup[input.studentGroup] ?? toneByGroup.AVERAGE,
      strengths:
        answerLen > 100
          ? ['Có nỗ lực trình bày câu trả lời']
          : ['Đã nộp bài đúng hạn'],
      improvements: [
        'Bổ sung thêm chi tiết và ví dụ cụ thể',
        'Sắp xếp ý theo thứ tự logic hơn',
      ],
      rubricBreakdown: [
        {
          criterion: 'Nội dung',
          score: contentPts,
          maxScore: Math.round(input.maxPoints * 0.4),
          comment: ratio >= 0.6 ? 'Đủ ý chính' : 'Cần bổ sung nội dung',
        },
        {
          criterion: 'Cấu trúc',
          score: structurePts,
          maxScore: Math.round(input.maxPoints * 0.3),
          comment: ratio >= 0.5 ? 'Tương đối mạch lạc' : 'Cần sắp xếp lại ý',
        },
        {
          criterion: 'Ngôn ngữ',
          score: languagePts,
          maxScore: Math.round(input.maxPoints * 0.3),
          comment: 'Cần diễn đạt rõ ràng hơn',
        },
      ],
      explanation: `Điểm ${suggestedPoints}/${input.maxPoints} dựa trên rubric chuẩn. Nhóm: ${groupMeta.label}.`,
    };
  }
}
