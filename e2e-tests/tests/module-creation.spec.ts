import { studioTest } from "./infra/studioTest.js";

studioTest("can create new nested modules", async ({ page, studioPage }) => {
  // create a new module
    // click a component inside a container
      // createModule() helper
        // click the properties tab
        // click create module
        // enter a name for the module
    // click the Save button
  // check that the component tree updates
    // check that the module name appears with the purple icon
  // take a screenshot
  // create a second module that includes the new module
    // click the container for the previously created module
    // createModule()
    // save()
  // check the component tree
    // check that the module name appears with the purple icon
  // take a screenshot
  // hit save
  // screenshot
  // refresh the page
  // check the tree
  // screenshot
});
