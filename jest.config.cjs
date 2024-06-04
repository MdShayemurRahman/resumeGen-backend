module.exports = {
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.js', 'server/**/*.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
