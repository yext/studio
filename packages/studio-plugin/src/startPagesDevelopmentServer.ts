import { spawn } from "node:child_process";

export const startPagesDevelopmentServer = () => {
  const pagesServer = spawn("npx", ["pages", "dev", "--open-browser=false"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
    },
    shell: true,
  });

  // stream pages server errors to parent process with a prefix
  pagesServer.stderr.setEncoding("utf-8");
  pagesServer.stderr.on("data", (data: string) => {
    data.split("\n").forEach((line: string) => {
      console.error("Pages Development Server |", line.trim());
    });
  });

  // exit the parent process if the pages server exits
  pagesServer.addListener("exit", () => {
    process.exit(-1);
  });
}