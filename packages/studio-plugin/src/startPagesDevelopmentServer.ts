import { spawn, exec } from "node:child_process";

export const startPagesDevelopmentServer = async () => {
  const pagesServer = spawn("npx", ["pages", "dev", "--open-browser=false"], {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
    },
  });

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

  // kill pages server parent process when studio exits
  process.on("exit", () => {
    pagesServer.kill();
  });

  // kill pages server child process when studio exits
  // by getting the dev server port on startup and then
  // killing the proceess running at that port
  const getPagesDevelopmentServerPort: Promise<string> = new Promise(
    (resolve) => {
      pagesServer.stdout.setEncoding("utf-8");
      pagesServer.stdout.on("data", (data: string) => {
        const matches = data.match(/listening on :(\d+)/);
        if (matches && matches.length >= 2) {
          resolve(matches[1]);
        }
        // default to 5173 if not found within 5 seconds
        setTimeout(() => resolve("5173"), 5000);
      });
    }
  );
  const port = await getPagesDevelopmentServerPort;
  process.on("exit", () => {
    exec(`kill $(lsof -t -i:${port})`);
  });
};
