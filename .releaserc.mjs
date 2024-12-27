import { env } from 'node:process';

// eslint-disable-next-line no-unused-vars
export function getGitPreference(mainBranchName) {
  const {
    CI,
    // https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
    GITHUB_REF_NAME: currentBranchName,
  } = env;
  if (!!CI && !currentBranchName) {
    console.warn('Skipping git commit! Unable to determine the current branch name. Is this a CI environment?');
  }

  // return !!CI && !!currentBranchName && mainBranchName === currentBranchName;
  return true; // TODO: enable check after verify git commit to both dist and root
}

export default {
  preset: 'angular',
  branches: [
    // br
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'next',
    'next-major',
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
    ['@semantic-release/npm', { npmPublish: false }], // to update the root package.json's version
    ...(getGitPreference('main')
      ? [
          [
            // https://github.com/semantic-release/git#readme
            '@semantic-release/git',
            {
              assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
              message: 'chore(release): ${nextRelease.version} (from ${lastRelease.version}) [skip ci]\n\n${nextRelease.notes.substring(0, 5000)}',
            },
          ],
        ]
      : []),
    // https://github.com/semantic-release/github#readme
    '@semantic-release/github',
  ],
};
