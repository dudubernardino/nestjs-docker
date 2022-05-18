import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/user.service';
import { AuthInput } from './dto/auth-input.input';
import { AuthType } from './dto/auth-type.object';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

    return {
      user,
      token,
    };
  }

  /**
   * @function generateJwtToken
   * @description Gera o token jwt de autenticação
   * @param {User} user - usuário
   * @returns {string}
   */
  private async generateJwtToken(user: User): Promise<string> {
    const payload = { username: user.name, sub: user.id };

    return this.jwtService.signAsync(payload);
  }
}