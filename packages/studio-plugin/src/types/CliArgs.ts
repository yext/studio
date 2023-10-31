export interface CliArgs {
  // The port to run studio on.
  port?: string;
  // The project root for studio.
  root?: string;
  // Any arguments present after double dashes when invoking studio, e.g.
  // `npx studio -- args like these` will result in ['args', 'like', 'these']
  // This option is always provided by the cac package, and we only use it to
  // configure Studio to run in React Strict Mode for internal development by
  // using `-- strict`.
  "--"?: string[];
}
