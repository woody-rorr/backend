import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBlogDto } from './create-blog.dto';

// PATCH body 명세: title?, content?, category?, tags?, published? (author 변경 불가)
export class UpdateBlogDto extends PartialType(
  OmitType(CreateBlogDto, ['author'] as const),
) {}
