import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Service status' })
  status: string;

  @ApiProperty({ example: 12345, description: 'Process uptime in seconds' })
  uptime: number;

  @ApiProperty({ example: '1.0.0', description: 'Application version' })
  version: string;
}
