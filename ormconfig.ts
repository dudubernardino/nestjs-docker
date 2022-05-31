import { join } from 'path';
import { ConnectionOptions } from 'typeorm';

const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/src/**/*.entity.js'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  migrationsTableName: 'migrations',
  migrations: ['dist/src/migrations/*.js'],
  cli: {
    // Location of migration should be inside src folder
    // to be compiled into dist/ folder.
    migrationsDir: 'src/migrations',
  },
  migrationsRun: false,
};

export = connectionOptions;
