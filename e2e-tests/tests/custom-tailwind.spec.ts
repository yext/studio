import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

studioTest.use({
  debug: true,
})

studioTest.only("can display styles from a custom tailwind theme", async ({ page, studioPage }) => {
  console.log('hey')
});
