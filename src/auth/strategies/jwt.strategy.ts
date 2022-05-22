import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: { sub: User['id']; username: string }) {
    const user = await this.userService.findById(payload.sub);

    if (!user) throw new UnauthorizedException('Unauthorized');

    try {
      await this.jwtService.verifyAsync(user.refreshToken, {
        secret: process.env.JWT_SECRET_KEY,
      });
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
