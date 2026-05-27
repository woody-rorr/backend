import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  check(): { status: string; uptime: number; version: string } {
    return { status: 'ok', uptime: process.uptime(), version: process.env.npm_package_version ?? '1.0.0' };
  }
}
