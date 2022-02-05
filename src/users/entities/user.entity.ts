import { Field, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  @Field()
  @Column({ name: 'username', type: 'varchar', length: 50 })
  username: string;

  @Field()
  @Column({ name: 'password', type: 'varchar', length: 50 })
  password: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;
}
