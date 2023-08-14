import { spawn } from "node:child_process";

export const startPagesDevelopmentServer = async () => {
  const pagesServer = spawn(
    "npx",
    ["pages", "dev", "--open-browser=false", "--local"],
    {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
      },
      shell: true,
    }
  );

  // stream pages server errors to parent process with a prefix
  pagesServer.stderr.setEncoding("utf-8");
  pagesServer.stderr.on("data", (data: string) => {
    data.split("\n").forEach((line: string) => {
      console.error("Pages Development Server |", line.trim());
    });
  });

  // kill studio if the pages server exits
  pagesServer.addListener("exit", () => {
    process.exit(-1);
  });

  // kill pages server child process when studio exits
  // by getting the dev server port on startup and then
  // killing the proceess running at that port
  const port: Promise<number> = new Promise((resolve) => {
    pagesServer.stdout.setEncoding("utf-8");
    pagesServer.stdout.on("data", (data: string) => {
      const matches = data.match(/listening on :(\d+)/);
      if (matches && matches.length >= 2) {
        const port = Number.parseInt(matches[1]);
        if (isNaN(port)) {
          throw new Error("Pages Development Server port was parsed as NaN.");
        }
        resolve(port);
      }
    });
  });

  return port;
};
