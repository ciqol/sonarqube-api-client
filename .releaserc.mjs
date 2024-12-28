export default {
  preset: 'angular',
  plugins: [
    // https://github.com/semantic-release/commit-analyzer#readme
    '@semantic-release/commit-analyzer',
    // https://github.com/semantic-release/release-notes-generator#readme
    '@semantic-release/release-notes-generator',
    // https://github.com/semantic-release/npm#readme
    ['@semantic-release/npm', { npmPublish: true, pkgRoot: 'dist' }],
    // https://github.com/semantic-release/github#readme
    '@semantic-release/github',
  ],
};
