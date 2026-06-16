import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthMiddleware } from '../middleware/jwt-auth.middleware';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthMiddleware],
  exports: [AuthService, JwtAuthMiddleware],
})
export class AuthModule {}
