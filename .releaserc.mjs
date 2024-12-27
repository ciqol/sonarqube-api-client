export default {
  preset: 'angular',
  branches: [
    // br
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  plugins: [
    // https://github.com/semantic-release/commit-analyzer#readme
    '@semantic-release/commit-analyzer',
    // https://github.com/semantic-release/release-notes-generator#readme
    '@semantic-release/release-notes-generator',
    // https://github.com/semantic-release/changelog#readme
    '@semantic-release/changelog',
    // https://github.com/semantic-release/npm#readme
    ['@semantic-release/npm', { npmPublish: true, pkgRoot: 'dist' }],
    // ['@semantic-release/npm', { npmPublish: false }], // to update the root package.json's version
    // https://semantic-release.gitbook.io/semantic-release/support/faq#making-commits-during-the-release-process-adds-significant-complexity
    // // https://github.com/semantic-release/git#readme
    // '@semantic-release/git',
    // https://github.com/semantic-release/github#readme
    '@semantic-release/github',
  ],
};
