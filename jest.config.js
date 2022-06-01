module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  testEnvironment: 'node',
  rootDir: './',
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
  },
  testRegex: 'src/.*\\.(test|spec).(ts|js)$',
  forceExit: true,
  transform: {
    '\\.(ts|tsx)$': '<rootDir>/fix-istanbul-decorators.js',
  },
};
