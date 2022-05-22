import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../users/entities/user.entity';
import { AuthenticatedUser } from '../users/user.decorator';
import { AuthService } from './auth.service';
import { AuthInput } from './dto/auth-input.input';
import { AuthType } from './dto/auth-type.object';
import { GqlAuthGuard } from './guards/auth.guard';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthType)
  login(@Args('data') data: AuthInput): Promise<AuthType> {
    return this.authService.validateUser(data);
  }

  @Mutation(() => String)
  refreshToken(@Args('oldToken') oldToken: string): Promise<string> {
    return this.authService.refreshToken(oldToken);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  logout(@AuthenticatedUser() user: User): Promise<boolean> {
    return this.authService.logout(user);
  }
}
