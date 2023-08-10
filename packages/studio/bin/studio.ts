#!/usr/bin/env node
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import cac from "cac";
import { CliArgs } from "@yext/studio-plugin";
import libexec from "libnpmexec"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToViteConfig = path.resolve(__dirname, "../../vite.config.ts");
const NODE_OPTIONS = 'NODE_OPTIONS="--experimental-specifier-resolution=node"';
const cli = cac();

const flatOptions = {
  _auth: null,
  access: null,
  all: false,
  allowSameVersion: false,
  omit: [],
  audit: true,
  auditLevel: null,
  authType: 'web',
  before: null,
  binLinks: true,
  browser: null,
  ca: null,
  // cache: '/Users/oshi/.npm/_cacache',
  // npxCache: '/Users/oshi/.npm/_npx',
  tufCache: '/Users/oshi/.npm/_tuf',
  cert: null,
  ciName: null,
  cidr: null,
  color: true,
  logColor: true,
  commitHooks: true,
  depth: null,
  search: {
    limit: 20,
    description: true,
    exclude: '',
    // opts: [Object: null prototype] {},
    staleness: 900
  },
  diff: [],
  diffIgnoreAllSpace: false,
  diffNameOnly: false,
  diffNoPrefix: false,
  diffDstPrefix: 'b/',
  diffSrcPrefix: 'a/',
  diffText: false,
  diffUnified: 3,
  dryRun: false,
  editor: 'vi',
  engineStrict: false,
  retry: { retries: 2, factor: 10, maxTimeout: 60000, minTimeout: 10000 },
  timeout: 300000,
  force: false,
  foregroundScripts: false,
  formatPackageLock: true,
  fund: true,
  git: 'git',
  gitTagVersion: true,
  global: false,
  globalconfig: '/Users/oshi/.nvm/versions/node/v18.16.0/etc/npmrc',
  heading: 'npm',
  httpsProxy: null,
  ifPresent: false,
  ignoreScripts: false,
  includeStaged: false,
  includeWorkspaceRoot: false,
  installLinks: false,
  installStrategy: 'hoisted',
  json: false,
  key: null,
  legacyPeerDeps: false,
  localAddress: null,
  location: 'user',
  lockfileVersion: null,
  silent: false,
  maxSockets: 15,
  message: '%s',
  noProxy: '',
  offline: false,
  omitLockfileRegistryResolved: false,
  otp: null,
  package: [],
  packageLock: true,
  packageLockOnly: false,
  packDestination: '.',
  parseable: false,
  preferDedupe: false,
  preferOffline: false,
  preferOnline: false,
  preid: '',
  progress: true,
  provenance: false,
  provenanceFile: null,
  proxy: null,
  readOnly: false,
  rebuildBundle: true,
  registry: 'https://registry.npmjs.org/',
  replaceRegistryHost: 'npmjs',
  save: true,
  saveBundle: false,
  savePrefix: '^',
  scope: '',
  projectScope: '',
  shell: '/bin/zsh',
  signGitCommit: false,
  signGitTag: false,
  strictPeerDeps: false,
  strictSSL: true,
  defaultTag: 'latest',
  tagVersionPrefix: 'v',
  umask: 0,
  unicode: true,
  userAgent: 'npm/9.8.1 node/v18.16.0 darwin x64 workspaces/true',
  workspacesEnabled: true,
  workspacesUpdate: true,
  npmBin: '/Users/oshi/.nvm/versions/node/v18.16.0/lib/node_modules/npm/bin/npx-cli.js',
  nodeBin: '/Users/oshi/.nvm/versions/node/v18.16.0/bin/node',
  hashAlgorithm: 'sha1',
  '//registry.npmjs.org/:_authToken': 'asdfasdfadsf',
  nodeVersion: 'v18.16.0',
  npmVersion: '9.8.1',
  npmCommand: 'exec',
  // chalk: [Function: chalk] createChalk { level: 3 },
  yes: null
}

cli
  .command("", "start dev server")
  .option("--port <port>", "[number] port to run studio")
  .option("--root <directory>", `[string] path to the root directory`)
  .action((options: CliArgs) => {
    // spawnSync(
    //   "npx",
    //   ["cross-env", NODE_OPTIONS, "npx", "vite", "--config", pathToViteConfig],
    //   {
    //     stdio: "inherit",
    //     env: {
    //       ...process.env,
    //       YEXT_STUDIO_ARGS: JSON.stringify(options),
    //     },
    //     shell: true,
    //   }
    // );
    libexec({
      args: [
        'cross-env',
        'NODE_OPTIONS=--experimental-specifier-resolution=node',
        'npx',
        'vite',
        '--config',
        '/Users/oshi/studio-prototype/packages/studio/vite.config.ts'
      ],
      runPath: '/Users/oshi/studio-prototype/apps/test-site',
      npxCache: '/Users/oshi/.npm/_npx',
      cache: '/Users/oshi/.npm/_cacache',

      ...flatOptions,
      
      call: '',
      locationMsg: 'in workspace \x1B[32mtest-site\x1B[39m at location:\n' +
        '\x1B[2m/Users/oshi/studio-prototype/apps/test-site\x1B[22m',
      path: '/Users/oshi/studio-prototype',
      binPaths: [ '/Users/oshi/studio-prototype/node_modules/.bin' ],
      scriptShell: 'sh'
    })
  });

cli.help();
cli.parse();
