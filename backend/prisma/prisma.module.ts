import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule if needed by PrismaService constructor

@Global() // Make PrismaService available globally without importing PrismaModule everywhere
@Module({
  imports: [ConfigModule], // Import if PrismaService depends on ConfigService
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService for DI
})
export class PrismaModule {}