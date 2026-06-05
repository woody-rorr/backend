import { Injectable, NotFoundException } from '@nestjs/common';
import { Member } from './entities/member.entity';
import { MemberRepository } from './member.repository';
import { UpdateMemberDto } from './dto/update-member.dto';

export interface GoogleProfile {
  google_id: string;
  email: string;
  name: string;
  profile_image_url?: string | null;
}

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  findByGoogleId(googleId: string): Promise<Member | null> {
    return this.memberRepository.findByGoogleId(googleId);
  }

  findById(id: string): Promise<Member | null> {
    return this.memberRepository.findById(id);
  }

  createFromGoogleProfile(profile: GoogleProfile): Promise<Member> {
    const member = this.memberRepository.create({
      googleId: profile.google_id,
      email: profile.email,
      name: profile.name,
      profileImageUrl: profile.profile_image_url ?? null,
    });
    return this.memberRepository.save(member);
  }

  async updateLastLoginAt(id: string): Promise<void> {
    await this.memberRepository.updateLastLoginAt(id, new Date());
  }

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: '회원을 찾을 수 없습니다',
      });
    }
    if (dto.name !== undefined) {
      member.name = dto.name;
    }
    if (dto.profile_image_url !== undefined) {
      member.profileImageUrl = dto.profile_image_url;
    }
    return this.memberRepository.save(member);
  }

  async softDelete(id: string): Promise<void> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: '회원을 찾을 수 없습니다',
      });
    }
    await this.memberRepository.softDelete(id);
  }
}
