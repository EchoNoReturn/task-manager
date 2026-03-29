import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../entities';
import { RegisterDto, LoginDto } from '../dto';
import { JwtPayload, TokenPair, RegistrationMode, RegistrationRequest as RegistrationRequestInterface } from '@taskmanager/shared';
import { SystemSettingsService } from '../../system-settings/service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  async register(dto: RegisterDto): Promise<{ success: boolean; message: string }> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('该邮箱已被注册');
    }

    const mode = await this.systemSettingsService.getRegistrationMode();

    if (mode === RegistrationMode.DISABLED) {
      throw new ForbiddenException('注册已禁用，请联系管理员');
    }

    if (mode === RegistrationMode.APPROVAL_REQUIRED) {
      throw new ForbiddenException('注册需要管理员审核，请等待审核结果');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      nickname: dto.nickname,
    });

    await this.userRepo.save(user);
    this.logger.log(`用户注册成功: ${user.id}`);

    return {
      success: true,
      message: '注册成功',
    };
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
    return {
      ...this.generateTokens(user),
      user: this.toUserPublic(user),
    };
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

      return {
        ...this.generateTokens(user),
        user: this.toUserPublic(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token 无效或已过期');
    }
  }

  private toUserPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
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

  private generateTokens(user: User) {
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
