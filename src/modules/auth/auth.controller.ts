import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { CreateUserSignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and issue an access token' })
  @ApiResponse({ status: 201, description: 'User created', type: AuthResponseDto })
  async signup(@Body() dto: CreateUserSignUpDto): Promise<AuthResponseDto> { return this.authService.signup(dto); }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user and issue an access token' })
  @ApiResponse({ status: 200, description: 'Authenticated', type: AuthResponseDto })
  async login(@Body() dto: SignInDto): Promise<AuthResponseDto> { return this.authService.login(dto); }
}
