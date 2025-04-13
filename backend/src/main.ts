import { NestFactory, Reflector } from '@nestjs/core'; // Import Reflector if using global guard
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common'; // Import pipes/interceptors
import { ConfigService } from '@nestjs/config'; // Import ConfigService
// import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Import if using global guard

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); // Get ConfigService instance

  // --- Global Pipes ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically remove properties without decorators from DTOs
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert primitive types automatically based on TS type
      },
    }),
  );

  // --- Global Interceptors ---
  // Use ClassSerializerInterceptor globally to automatically handle @Exclude() / @Expose()
  // Ensure your DTOs use these decorators if you need serialization control
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));


  // --- CORS ---
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin, // Allow requests from your frontend URL
    // origin: 'http://frontend:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Allow cookies/auth headers
    // allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  console.log(`CORS enabled for origin: ${corsOrigin}`);

  // --- Global Guards (Alternative to decorating controllers/handlers) ---
  // If you want MOST routes protected by default, apply JwtAuthGuard globally
  // You will NEED the @Public() decorator on login/register routes for this to work.
  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new JwtAuthGuard(reflector)); // Provide reflector instance


  // --- Start Application ---
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();