import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness probe for ECS / ALB' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        uptime: { type: 'number', example: 12.34 },
      },
    },
  })
  check(): { status: string; uptime: number } {
    return { status: 'ok', uptime: process.uptime() };
  }
}
