import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.interface';
import { TokenPair } from './types/token-pair.interface';

const REFRESH_TOKEN_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.deletadoEm) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const validPassword = await bcrypt.compare(dto.senha, user.senha);
    if (!validPassword) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.generateTokens({
      sub: user.idUsuario,
      email: user.email,
      roles: user.roles,
    });
    await this.persistRefreshToken(user.idUsuario, tokens.refreshToken);

    return {
      ...tokens,
      usuario: {
        id: user.idUsuario,
        nome: user.nome,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const user = await this.prisma.usuario.findUnique({
      where: { idUsuario: payload.sub },
    });

    if (!user?.refreshToken || user.deletadoEm) {
      throw new UnauthorizedException('Sessão inválida');
    }

    const validToken = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!validToken) {
      throw new UnauthorizedException('Sessão inválida');
    }

    const tokens = await this.generateTokens({
      sub: user.idUsuario,
      email: user.email,
      roles: user.roles,
    });
    await this.persistRefreshToken(user.idUsuario, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number): Promise<void> {
    await this.prisma.usuario.update({
      where: { idUsuario: userId },
      data: { refreshToken: null },
    });
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  private async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(
    usuarioId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);
    await this.prisma.usuario.update({
      where: { idUsuario: usuarioId },
      data: { refreshToken: hash },
    });
  }
}
