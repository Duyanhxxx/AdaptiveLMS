import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ReorderLessonsDto {
  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiProperty({ type: [String], description: 'Lesson IDs in desired order' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  lessonIds: string[];
}
