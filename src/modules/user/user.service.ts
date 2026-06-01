import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  // UC-USER-01: 유저 상세 정보 조회 (GET /users/:id)
  async getUser(id: string): Promise<UserResponseDto> {
    // step 1 | load: 유저 조회
    const user = await this.userRepository.findById(id);

    // error case: 404 USER_NOT_FOUND
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '유저를 찾을 수 없습니다',
      });
    }

    // 응답 DTO 매핑 (passwordHash 등 민감 필드 미노출)
    return UserResponseDto.fromEntity(user);
  }
}
