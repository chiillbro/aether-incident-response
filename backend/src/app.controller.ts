import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // --- ADD DEDICATED HEALTH CHECK ---
  @Public() // Make health check public
  @Get('health') // Handles /server-api/health
  @HttpCode(HttpStatus.OK) // Ensure it returns 200 OK
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
