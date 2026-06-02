import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { GoogleProfile } from './strategies/google.strategy';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthResult {
  accessToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateOrCreateUser(profile: GoogleProfile): Promise<User> {
    let user = await this.userRepo.findOne({
      where: { googleId: profile.googleId },
    });
    if (!user) {
      user = this.userRepo.create({
        googleId: profile.googleId,
        email: profile.email,
        displayName: profile.displayName,
        profileImageUrl: profile.profileImageUrl,
      });
      user = await this.userRepo.save(user);
    }
    return user;
  }

  issueAccessToken(user: User): string {
    const payload: JwtPayload = { sub: user.id, email: user.email, roles: [] };
    return this.jwtService.sign(payload);
  }

  async loginWithGoogle(profile: GoogleProfile): Promise<AuthResult> {
    const user = await this.validateOrCreateUser(profile);
    const accessToken = this.issueAccessToken(user);
    return { accessToken, user };
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다',
      });
    }
    return user;
  }
}
