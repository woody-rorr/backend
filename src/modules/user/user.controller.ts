import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: '유저 상세 정보 조회' })
  @ApiResponse({ status: 200, description: '조회 성공', type: UserResponseDto })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  @ApiResponse({ status: 404, description: '유저 없음 (USER_NOT_FOUND)' })
  getUser(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.userService.getUser(id);
  }
}
