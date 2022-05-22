import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Não pode ser vazio' })
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Não pode ser vazio' })
  username: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Não pode ser vazio' })
  password: string;
}
