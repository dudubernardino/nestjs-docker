import { User } from 'src/modules/users/entities/user.entity';

export default class TestUtil {
  static getValidUser(): User {
    const user = new User();

    user.id = '4378b226-90b5-11ec-b909-0242ac120002';
    user.name = 'Eduardo';
    user.username = 'dudubernardino';
    user.password = 'password';

    return user;
  }
}
