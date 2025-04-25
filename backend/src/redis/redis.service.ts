import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, {Redis as RedisClient} from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy{
  private client: RedisClient;
  private subscriber: RedisClient;

  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}
  private listeners = new Map<string, (message: string) => void>();


  onModuleInit() {
    const redisOptions = {
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      // password: this.configService.get<string>('REDIS_PASSWORD'), // Add if needed
      maxRetriesPerRequest: null, // Important for subscriber resilience
    };

    this.client = new Redis(redisOptions);
    this.subscriber = new Redis(redisOptions); // Dedicated subscriber connection

    this.client.on('connect', () => this.logger.log('Redis publisher connected'));
    this.client.on('error', (err) => this.logger.error('Redis publisher error', err));
    this.subscriber.on('connect', () => this.logger.log('Redis subscriber connected'));
    this.subscriber.on('error', (err) => this.logger.error('Redis subscriber error', err));

    // Handle incoming messages on the subscriber client
    this.subscriber.on('message', (channel, message) => {
        this.logger.debug(`Received message from Redis channel '${channel}'`);
        const handler = this.listeners.get(channel);
        if (handler) {
            try {
                handler(message); // Execute the registered handler
            } catch (error) {
                this.logger.error(`Error in Redis message handler for channel ${channel}`, error);
            }
        }
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
    this.logger.log('Redis connections closed');
  }


  // Method to publish messages
  async publish(channel: string, message: string | Record<string, any>): Promise<number> {
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);
    this.logger.debug(`Publishing to Redis channel '${channel}'`);
    return this.client.publish(channel, messageString);
  }

  // Method for components (like Gateway) to subscribe
  async subscribe(channel: string, handler: (message: string) => void) {
    if (!this.listeners.has(channel)) {
         this.logger.log(`Subscribing to Redis channel: ${channel}`);
        await this.subscriber.subscribe(channel);
    } else {
         this.logger.warn(`Already subscribed to Redis channel: ${channel}. Overwriting handler.`);
    }
    this.listeners.set(channel, handler);
  }

  // Method to unsubscribe
  async unsubscribe(channel: string) {
    if (this.listeners.has(channel)) {
        this.listeners.delete(channel);
        // Only unsubscribe from Redis if no other listeners exist for this channel
        // (simple approach: assume one listener per channel for now)
         this.logger.log(`Unsubscribing from Redis channel: ${channel}`);
        await this.subscriber.unsubscribe(channel);
    }
  }
   // Add a method to get the publisher client if needed elsewhere
   getPublisherClient(): RedisClient {
       return this.client;
   }
}
