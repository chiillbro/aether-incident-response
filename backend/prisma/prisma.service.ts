import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config'; // To potentially get DB URL if needed

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    // Pass datasource url if needed, though Prisma usually gets it from env/schema
    super({
      // datasources: {
      //   db: {
      //     url: config.get<string>('DATABASE_URL'), // Ensures ConfigModule is ready
      //   },
      // },
    });
    // console.log('PrismaService instantiated');
  }

  async onModuleInit() {
    // console.log('PrismaService connecting...');
    await this.$connect();
    // console.log('PrismaService connected.');
  }

  async onModuleDestroy() {
    // console.log('PrismaService disconnecting...');
    await this.$disconnect();
    // console.log('PrismaService disconnected.');
  }

  // Optional: Add cleanDb method for e2e testing if needed later
  // async cleanDatabase() {
  //   // Transaction to delete in specific order due to relations
  //   return this.$transaction([
  //     // Add deleteMany calls for your models in reverse order of dependency
  //     this.message.deleteMany(),
  //     this.task.deleteMany(),
  //     // ... other models
  //     this.incident.deleteMany(),
  //     this.user.deleteMany(),
  //     this.team.deleteMany(),
  //   ]);
  // }
}