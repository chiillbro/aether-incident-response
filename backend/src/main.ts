// import { NestFactory, Reflector } from '@nestjs/core'; // Import Reflector if using global guard
// import { AppModule } from './app.module';
// import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common'; // Import pipes/interceptors
// import { ConfigService } from '@nestjs/config'; // Import ConfigService
// // import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Import if using global guard

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const configService = app.get(ConfigService); // Get ConfigService instance

//   // --- Global Pipes ---
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true, // Automatically remove properties without decorators from DTOs
//       forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
//       transform: true, // Automatically transform payloads to DTO instances
//       transformOptions: {
//         enableImplicitConversion: true, // Convert primitive types automatically based on TS type
//       },
//     }),
//   );

//   // --- Global Interceptors ---
//   // Use ClassSerializerInterceptor globally to automatically handle @Exclude() / @Expose()
//   // Ensure your DTOs use these decorators if you need serialization control
//   // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));


//   // --- CORS ---
//   const corsOrigin = configService.get<string>('CORS_ORIGIN');
//   app.enableCors({
//     origin: corsOrigin, // Allow requests from your frontend URL
//     // origin: 'http://frontend:3000',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true, // Allow cookies/auth headers
//     // allowedHeaders: 'Content-Type, Accept, Authorization',
//   });
//   console.log(`CORS enabled for origin: ${corsOrigin}`);

//   // --- Global Guards (Alternative to decorating controllers/handlers) ---
//   // If you want MOST routes protected by default, apply JwtAuthGuard globally
//   // You will NEED the @Public() decorator on login/register routes for this to work.
//   // const reflector = app.get(Reflector);
//   // app.useGlobalGuards(new JwtAuthGuard(reflector)); // Provide reflector instance


//   // --- Start Application ---
//   const port = configService.get<number>('PORT') || 3000;
//   await app.listen(port);
//   console.log(`🚀 Application is running on: http://localhost:${port}`);
// }
// bootstrap();


// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);


  app.setGlobalPrefix('server-api')
  // --- Global Pipes ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // --- CORS ---
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  if (!corsOrigin) {
    console.warn('!!! CORS_ORIGIN not found in environment variables! CORS might fail!');
  }
  app.enableCors({
    origin: corsOrigin || false, // Fallback to false if not set, preventing open CORS
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  console.log(`CORS configuration attempted for origin: ${corsOrigin}`); // Log configured origin

  // --- Start Application ---
  const port = configService.get<number>('PORT') || 3000; // Default to 3000 if PORT env var missing
  const node_env = configService.get<string>('NODE_ENV') || 'development'; // Default to development if NODE_ENV env var missing

  // --- ADD RUNTIME ENV VAR LOGGING ---
  const dbUrlFromEnv = configService.get<string>('DATABASE_URL');
  console.log(`RUNTIME CHECK - DATABASE_URL from ConfigService: ${dbUrlFromEnv}`);
  // --- CORRECTED CHECK (use underscore) ---
if (node_env === "production" && (!dbUrlFromEnv || !dbUrlFromEnv.includes('aether_prod'))) {
  console.error('!!! RUNTIME ERROR - DATABASE_URL does not seem correct or is missing !!!');
} else {
  // Optional: Add a success log if the check passes
  console.log('RUNTIME CHECK - DATABASE_URL appears correct.');
}
// --- END CORRECTION ---
  console.log(`RUNTIME CHECK - PORT from ConfigService: ${port}`);
  console.log(`RUNTIME CHECK - NODE_ENV from ConfigService: ${configService.get<string>('NODE_ENV')}`);
  // --- END LOGGING ---

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/server-api`); // This log is from within the container
}
bootstrap();