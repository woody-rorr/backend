import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserSignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

const BCRYPT_SALT_ROUNDS = 10;

interface JwtPayload { sub: string; email: string; roles: string[]; }
type AuthenticatedUser = { id: string; email: string; name: string; createdAt: Date | string; };

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}
  async signup(dto: CreateUserSignUpDto): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException({ code: 'EMAIL_EXISTS', message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.usersService.createUser({ email: dto.email, passwordHash, name: dto.name });
    return this.buildAuthResponse(user);
  }
  async login(dto: SignInDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    const ok = !!user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !ok) throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    return this.buildAuthResponse(user);
  }
  private buildAuthResponse(user: AuthenticatedUser): AuthResponseDto {
    const payload: JwtPayload = { sub: user.id, email: user.email, roles: [] };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt },
    };
  }
}
