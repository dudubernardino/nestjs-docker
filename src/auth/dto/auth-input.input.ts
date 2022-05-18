import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class AuthInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Não pode ser vazio' })
  username: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Não pode ser vazio' })
  password: string;
}
