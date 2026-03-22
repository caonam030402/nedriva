import type { UserConfig } from '@commitlint/types';

/**
 * Optional gitmoji before type (`🔧 chore: …`), aligned with cz-customizable `typeEmojis`.
 * Must stay 3 capture groups (type, scope, subject) so conventional-commits-parser
 * `parseBreakingHeader` keeps using `matches[3]` as the subject text.
 */
const gitmojiPrefix = '(?:\\p{Extended_Pictographic}+\\s)?';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: new RegExp(`^${gitmojiPrefix}(\\w*)(?:\\((.*)\\))?!?: (.*)$`, 'u'),
      breakingHeaderPattern: new RegExp(`^${gitmojiPrefix}(\\w*)(?:\\((.*)\\))?!: (.*)$`, 'u'),
    },
  },
  ignores: [
    (message: string) => message.startsWith('chore: bump') || message.startsWith('Updating'),
  ], // Ignore dependabot commits
};

export default Configuration;
