import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { RedisCacheService } from 'src/database/services/redis-cache.service';
import { User } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';

import { AuthInput } from './dto/auth-input.input';
import { AuthType } from './dto/auth-type.object';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisCacheService,
  ) {}

  /**
   * @function validateUser
   * @description Valida um usuário
   * @param {string} username - username do usuário
   * @param {string} password - password do usuário
   * @returns {User | null}
   */
  async validateUser(data: AuthInput): Promise<AuthType> {
    const user = await this.userService.findByUsername(data.username);

    if (!user) throw new UnauthorizedException('Username e/ou senha inválidos');

    const isPasswordValid = compareSync(data.password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Username e/ou senha inválidos');

    const token = await this.generateJwtToken(user);

    user.refreshToken = token;

    await User.save(user);

    return {
      user,
      token,
    };
  }

  /**
   * @function refreshToken
   * @description Gera um refresh token
   * @param {string} oldToken - username do usuário
   * @returns {string}
   */
  async refreshToken(oldToken: string): Promise<string> {
    const user = await User.findOne({
      where: { refreshToken: oldToken },
    });

    if (!user) throw new UnauthorizedException('Token inválido');

    const refreshToken = await this.generateJwtToken(
      user,
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    );

    user.refreshToken = refreshToken;

    await User.save(user);

    return refreshToken;
  }

  async logout(user: User): Promise<boolean> {
    const revokeAccessToken = await this.generateJwtToken(
      user,
      process.env.JWT_REVOKE_ACCESS_EXPIRES_IN,
    );

    user.refreshToken = revokeAccessToken;

    await User.save(user);

    const getUserByCache = await this.redis.get(`User-${user.id}`);

    if (getUserByCache) await this.redis.del(`User-${user.id}`);

    return true;
  }

  /**
   * @function generateJwtToken
   * @description Gera o token jwt de autenticação
   * @param {User} user - usuário
   * @returns {string}
   */
  private async generateJwtToken(
    user: User,
    expiresIn?: string,
  ): Promise<string> {
    const payload = { username: user.name, sub: user.id };

    return expiresIn
      ? this.jwtService.sign(payload, {
          expiresIn,
        })
      : this.jwtService.signAsync(payload);
  }
}
