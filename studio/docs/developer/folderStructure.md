# Folder Structure

![Folder Structure](/images/folderStructure.png)

The above image shows the folder structure of a Studio page's source code.
Currently all files live under the `src` folder. (Probably, studio.ts should live outside of it.)

The components, layout, and pages folders house their respective types of React components.
Each file is expected to export exactly 1 component.

Site Settings live inside siteSettings.ts

Eventually, configuration for plugins that extend Studio, for instance providing extra components,
will live inside studio.ts.