import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthInput } from './dto/auth-input.input';
import { AuthType } from './dto/auth-type.object';

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
}
