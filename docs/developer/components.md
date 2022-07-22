# Components

New components can be added to a Studio site by creating a new .tsx file in the `src/components` folder.

Each component file is expected to export exactly one functional React component.

The component must either be a default export, or the named export should match the name of the file,
for instance `Banner.tsx` would export a function named `Banner`.
Note that React itself requires components to start with a capital letter.

Besides that, the only other restriction to a component file is that any required props should have defaults provided
for them via an `initialProps` export. Otherwise when an Admin adds the component to the page no value will be provided for the prop despite it being required.
For now, we recommend all props being optional

Here is an example component.

```tsx
import { HexColor } from "../../studio/types";

export interface BannerProps {
  /** Banner title! */
  title?: string,
  /** 
   * Some random
   * number to display!
   */
  randomNum?: number,
  /**
   * A boolean to toggle nothing..
   */
  someBool?: boolean,
  /** Make it colorful */
  backgroundColor?: HexColor
}

export const initialProps: BannerProps = {
  randomNum: 42
}

export default function Banner(props: BannerProps) {
  const className = `w-fill p-3 flex flex-col items-center border-b-2 border-black`;
  return (
    <div className={className} style={{'backgroundColor': `${props.backgroundColor ?? '#ffffff'}`}}>
      <h1 className='text-3xl p-1'>
        {props.title || 'Default Title'}
      </h1>
      {props.randomNum && <h2>{props.randomNum}</h2>}
      <h3>{props.someBool ? 'true' : 'false'}</h3>
    </div>
  );
}
```

Studio parses a component file in order to generate the UI that is shown to admins.
There are a number of things to notice here:

## ComponentProps

If a component has props, it should export an interface named `[ComponentName]Props`, i.e. for a component named
`Banner` an interface named `BannerProps` should be exported. Studio will use this interface to generate a PropEditor
UI for the component. Currently only string, number, and boolean props are supported, plus Special Props exported from Studio itself which we'll get to below.

## Special Props

Studio supports special props (currently only `HexColor`) which have their own special PropEditor UI. For example, HexColor will generate a color picker UI.

## Prop Tooltips

JSDoc style comments (i.e. block comments) above props will be interepted as tooltips by Studio.

## `initialProps` export

If an `initialProps` export exists, Studio will use it to seed the props whenever a new instance of a component is added to the page by an Admin.