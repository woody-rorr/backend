import { Test, TestingModule } from '@nestjs/testing';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

describe('RankingController', () => {
  let controller: RankingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [RankingService],
    }).compile();

    controller = module.get<RankingController>(RankingController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns 5 bars and graphWidth 100', () => {
    const res = controller.getStreakRanking();
    expect(res.bars).toHaveLength(5);
    expect(res.graphWidth).toBe(100);
  });

  it('returns expected top mock entry', () => {
    const res = controller.getStreakRanking();
    expect(res.bars[0]).toMatchObject({
      userName: 'woody',
      currentStreak: '12일',
      streakLong: 30,
      streakRate: 1.0,
    });
  });
});
