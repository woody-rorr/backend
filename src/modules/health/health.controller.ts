import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness health check' })
  @ApiResponse({
    status: 200,
    description: 'Service is up',
    schema: {
      example: { status: 'ok', uptime: 123.45, version: '1.0.0' },
    },
  })
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      version: process.env.npm_package_version ?? '1.0.0',
    };
  }
}
