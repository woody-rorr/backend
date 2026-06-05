import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';

@Injectable()
export class MemberRepository {
  constructor(
    @InjectRepository(Member)
    private readonly repo: Repository<Member>,
  ) {}

  findByGoogleId(googleId: string): Promise<Member | null> {
    return this.repo.findOne({ where: { googleId } });
  }

  findById(id: string): Promise<Member | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Member>): Member {
    return this.repo.create(data);
  }

  save(member: Member): Promise<Member> {
    return this.repo.save(member);
  }

  async updateLastLoginAt(id: string, when: Date): Promise<void> {
    await this.repo.update({ id }, { lastLoginAt: when });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }
}
