import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => Boolean)
  createUser(@Args('data') data: CreateUserInput): Promise<boolean> {
    return this.userService.create(data);
  }

  @Mutation(() => Boolean)
  updateUser(@Args('data') data: UpdateUserInput): Promise<boolean> {
    return this.userService.update(data);
  }

  @Query(() => [User])
  findAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User)
  findUserById(@Args('userId') userId: string): Promise<User> {
    return this.userService.findById(userId);
  }

  @Query(() => User)
  findUserByUsername(@Args('username') username: string): Promise<User> {
    return this.userService.findByUsername(username);
  }

  @Mutation(() => Boolean)
  deleteUser(@Args('userId') userId: string): Promise<boolean> {
    return this.userService.delete(userId);
  }
}
