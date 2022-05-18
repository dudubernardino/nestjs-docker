import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/guards/auth.guard';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { AuthenticatedUser } from './user.decorator';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => Boolean)
  createUser(@Args('data') data: CreateUserInput): Promise<boolean> {
    return this.userService.create(data);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  updateUser(@Args('data') data: UpdateUserInput): Promise<boolean> {
    return this.userService.update(data);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  findAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  findUserById(@Args('userId') userId: string): Promise<User> {
    return this.userService.findById(userId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  findUserByUsername(@Args('username') username: string): Promise<User> {
    return this.userService.findByUsername(username);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  deleteUser(@Args('userId') userId: string): Promise<boolean> {
    return this.userService.delete(userId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  me(@AuthenticatedUser() user: User) {
    return this.userService.findById(user.id);
  }
}
