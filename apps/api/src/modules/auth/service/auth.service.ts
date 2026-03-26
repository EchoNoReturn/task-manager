import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../entities';
import { RegisterDto, LoginDto } from '../dto';
import { JwtPayload, TokenPair } from '@taskmanager/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('该邮箱已被注册');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      nickname: dto.nickname,
    });

    await this.userRepo.save(user);
    this.logger.log(`用户注册成功: ${user.id}`);

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    this.logger.log(`用户登录成功: ${user.id}`);
    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token 无效或已过期');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    this.logger.log(`用户登出`);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      this.logger.log(`密码重置请求: ${email}`);
    }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await this.userRepo.save(user);
      this.logger.log(`密码重置成功: ${user.id}`);
    } catch (error) {
      throw new BadRequestException('重置令牌无效或已过期');
    }
  }

  private generateTokens(user: User): TokenPair {
    const payload: JwtPayload = { sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
