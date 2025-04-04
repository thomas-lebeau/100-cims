//@ts-check

import { relative } from "path";

const lint = (filenames) =>
  `next lint --file ${filenames.map((file) => relative(process.cwd(), file)).join(" --file ")}`;

/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  // __X__ is a hack to make the tasks run in parallel on the same files,
  // It's ok as long as the tasks don't edit the files
  "*.{js,mjs,ts,tsx,__A__}": lint,
  "*.{js,mjs,ts,tsx,__B__}": "prettier --check",
  "*.{js,mjs,ts,tsx,__C__}": () => "tsc -p . --noEmit",
  "*.{js,mjs,ts,tsx,__D__}": "jest --passWithNoTests",
};
