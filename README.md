# Studio Bug Bash

Welcome to the Bug Bash for Studio! This README will help you get setup with Studio and acquaint you with its features. You can find the Issue/Enhancement Submission form [here](https://docs.google.com/forms/d/e/1FAIpQLScV8tnR7pS6DnBStRaw2CLnupd5ogOpWSHln82EdOqWg_cFMw/viewform). You can see what's already been submitted in this [Sheet](https://docs.google.com/spreadsheets/d/1YYUOtUm8qtELUlnCJ2Btb72irirRy0iHiC6Vo5uh7p0/edit?usp=sharing).

## What is Studio?

Studio is a tool that lets Admins and Developers alike build React Applications with ease. For now, we're focused on Applications corresponding to a Site. But, that may change in the future. It provides a no-code, visual Editor that allows users to add and remove pages, add and remove Components to pages, and configure Components on a page. Here's a screenshot of Studio in action:

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-02+at+8.58.09+AM.png)

Okay, cool. But how is this really different from SquareSpace or Landing Pages? For starters, Studio generates a React Site under the hood. That means better page performance. However, the key difference is the accessibility of the generated files. As users perform operations in the Editor, Studio is writing human-readable, well formulated TSX files to the repo. Developers can easily work with, and directly modify, these TSX files outside Studio, as need be. Neither SquareSpace nor Landing Pages make the generated code accessible. Even if they did, the code is not human readable.

## Setting up your Studio Repository

1. To start, clone this starter repo. It mimics a PagesJS-style setup.
2. Make sure you're using a modern Node version, specifically v18.
3. Run `npm install`.
4. The starter is meant to be used with Slapshot's test account in Production (`businessId` of 3350634). Using the Yext CLI, generate authorization credentials for this account.

To make sure you're set up properly, invoke `npm run studio` in the terminal. Instead of the PagesJS dev server being spun up, you should see Yext Studio appear!

This command is set up to first generate the features.json and local test data before starting Studio.
If you would like to just start Studio without additional setup, you can run `npx studio`.

## Adding and Removing Pages

Your Site currently has one page: `location`. This page is actually an Entity Template. Studio's chosen a random Entity to render the preview you see. You'll want to add more pages, which can be either Static or Entity Templates. A new page can be added by using the `+` icon here:

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-02+at+9.07.15+AM.png)

A modal will appear, prompting you to name your new page. Under the hood, a new TSX file is generated in the `src/templates` directory of your repo. If you want to remove a page, simply click the `x` icon associated with it. You can toggle between different Site pages in the Editor. To do this, simply click on the desired page name under the `Pages` header. A check-mark will appear to indicate this is the active page in Studio's Edit Mode.

## Working With Components

### Adding Components to a Page

Now that you have a page, you probably want to do some things with it. Specifically, you'll want to add Components to it. Adding a Component to a page is simple. Once you've set the desired page to active, click the icon in the top-left and you will see a drop-down like the following:

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-02+at+9.18.10+AM.png)

These are the various Components that can be added to your page. For now, you can ignore Layouts and Modules. Those will be described later. Once you select a Component, such as `Banner`, it will appear in the middle preview pane and on the left-hand side under `Layers`:

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-03+at+9.41.51+AM.png)

In the `Layers` Pane, you can re-order the Components on the page by simply clicking and dragging them.

### Configuring Components on a Page

To configure the Component, click on it under the `Layers` Section. That should highlight it in the page preview. Additionally, the `Properties` shown on the left-hand side should be populated:

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-02+at+9.49.08+AM.png)

These are the props of the relevant Component (in this case `Banner`). You'll notice that the Props have a toggle between `Literal` or `Expression` above them. When `Literal` is used for a prop, that means the value is static. To source the prop value from a Stream Document, you'd use `Expression`. We will go into more detail about this below. But first, if you want to remove a Component from the page, simply click the `x` icon next to it under `Layouts`.

### Stream Powered Props

For a Stream to power a Component prop's value, additional setup needs to be done first outside of Studio. This would be done by the Developer. Firstly, the Developer would need to manually update the page's TSX file to resemble a PagesJS Template. This allows the page to accept a Stream `document` and scaffolds a Stream Configuration for the Page/Template. The modifications would look something like:

```ts
export const config: TemplateConfig = {
  stream: {
    $id: "my-stream-id-1",
    fields: [],
    // Defines the scope of entities that qualify for this stream.
    filter: {
      entityTypes: ["location"],
    },
    // The entity language profiles that documents will be generated for.
    localization: {
      locales: ["en"],
    },
  },
};

const Component: Template<TemplateRenderProps> = ({document, props: ComponentProps}) => ...
export default Component;
```

The `fields` attribute of the Stream Configuration can be populated from the UI. If someone were to use `document.address` as the value for an `Expression` prop, Studio would addend `"address"` to the `fields` array. All other aspects of the Stream (`localization`, `filter`, etc.) must be configured directly in the file by the Developer.

Once an `Expression` value is used for a prop, and the above setup is complete, the page becomes an Entity Template, it's no longer Static.

### Site Settings Powered Props

Site Settings (Attributes) can be used within `Expression` props in a similar way to Streams data. For example, you can specify `siteSettings.["Global Colors"].primary` and the corresponding Site Settings value will be passed to the component. The process for adding, removing, and modifying Site Settings is covered in a later section.

### Authoring New Components

Developers have the ability to craft new Components that can then be used in Studio. As an example, an Admin might ask for a net-new piece of functionality on the page. The Developer would create the corresponding Component, which the Admin could then use. Authoring a Component is fairly simple. It starts with adding a new TSX file to `src/components`. The file will have the form:

```tsx
export interface SomeComponentProps {
  prop1: string,
  prop2?: number,
  ...
};

export default function SomeComponent(props: SomeComponentProps) {
  return (
    <div>
      ...
    </div>
  );
}
```

Optionally, the Developer can specify initial values for the Component's props. In the same file, they'd add something like:

```ts
export const initialProps: SomeComponentProps = {
  prop1: "Hello World",
};
```

When the new Component is added to a page, the `Properties` tab on the left-hand side will be seeded with the defaults.

We've already added a few custom Components to the starter for you. One is a Banner, to prominently display an Entity's address. We also added an Entity Result Card and CTA in case you want to add Search functionality. You can use these Components as a guide when writing your own.

## Reuse through Modules

Users may find that they use a certain combination of Components often across pages. For example, they may often pair a Search Bar Component with a Results Component. Repeating this combination over and over, for each page is tedious. That's where Studio Modules come in. A Module represents a named combination of Components. They can be added to a Page just like a single Component.

### Creating a Module

Creating a Module is simple and can be done entirely within Studio. No Developer intervention is needed! To start, you will need to add a Layout. This is done by clicking the same Icon you did for adding a Component:

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-02+at+12.38.01+PM.png)

A Layout groups a set of Studio Components. Once the Layout is in place on the page, add the Components that you want in the Layout. The Components will initially be siblings of the Layout. In the `Layers` pane, you will need to drag the Components under Layout.

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-02+at+1.07.06+PM.png)

Once the Layout has all the necessary Components, click it and you will see a `Create Module` button appear:

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-02+at+1.00.17+PM.png)

The button will open a modal that prompts you to name your Module. The Module is then available for use on any page! The TSX file for the Module will be under `src/modules` in the repo.

## Site Settings

Often, you will want to have attributes that are accessible to all pages within a Site. In Classic Pages, these were known as Site Attributes. In the new Sites system, we usually recommend adding these attributes to a Site Entity. Studio provides an additional mechanism for supplying these values: the `src/siteSettings.ts` file. We cannot rely exclusively on a Site Entity because Studio can be used outside of PagesJS. The `siteSettings.ts` file is initially setup by the Developer:

```ts
export interface SiteSettings {
  attribute1: string;
  attribute2: number;
  primaryColor: HexColor;
}

export default {
  attribute1: "Hello World",
  attribute2: 1,
  primaryColor: "#AABBCC",
};
```

The `SiteSettings` interface defines what attributes are available Site-wide. Optionally, defaults can be provided using the default export.

With this file in place, a user can edit the values of the Settings directly in Studio. To do so, click on the `SiteSettings` button in the right-hand panel:

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-03+at+12.12.37+PM.png)

Note that you cannot add or remove Settings from within Studio. That needs Developer intervention.

## File History and Committing Changes

What if you make a mistake in the Editor? Say removing a Page accidentally, updating a Component's Props incorrectly, etc. By maintaining a history of your edits, Studio provides powerful Undo functionality. You can undo actions one at a time, until you return to the desired state. Likewise, Studio has Redo functionality. Both features are accessed in the top-right, using these buttons:

![enter image description here](https://yext-studio-images.s3.amazonaws.com/Screen+Shot+2023-02-02+at+10.28.42+AM.png)

Once you're happy with the changes made during your session, you can click the `Save` button on the top-right. This will make all updates to the necessary TSX files in the repo. Note that Studio does not write to any files until `Save` is invoked. The preview is actually powered by a virtual representation of the Site.
