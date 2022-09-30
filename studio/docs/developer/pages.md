# Pages

The source code for a page file looks something like the below

```tsx
import Banner from '../components/Banner'
import Layout from '../layouts/layout'

export default function () {
  return (
    <Layout>
      <Banner title='first!' randomNum={1} />
      <Banner />
      <Banner
        title='three'
        randomNum={3}
        someBool={false}
        backgroundColor='#00ff00'
      />
    </Layout>
  )
}
```

Page files have the following restrictions:

1. They must export a default React component. The React component must be a function.
2. The function's return value must follow a structure similar to above - where there is a single container component with an array of child components. We do not support more complicated structures.
3. Currently, components only support primitive type arguments, i.e. `string | number | boolean`, as well as any special prop types like `HexColor` which are exported from Studio. We plan to add support for more complicated props in the future.

Currently, Studio only supports a single hardcoded page file, index.tsx. In the future both Admins and Developers will be able to add/remove/rename pages.

Almost everything else is fair game, which means that something like the below **IS** valid and understood by Studio.

```tsx
import Banner from '../components/Banner'
import Layout from '../layouts/layout'
import { useState, useEffect } from 'react'
import '../mySpecialCss.css'

const MyConfig = {
  /** do whatever you want oustide of the function **/
}

export default function MyPage() {
  const [something, setSomething] = useState();
  useEffect(() => {
    // do something crazy
  })

  return <Layout>
    <Banner title='first!' randomNum={1} />
    <Banner />
    <Banner
      title='three'
      randomNum={3}
      someBool={false}
      backgroundColor='#00ff00'
    />
  </Layout>
}
```

However the following page code is **NOT** supported due to complicated nesting in the return statement.

```tsx
import Banner from '../components/Banner'

export default function () {
  return (
    <div>
      <div className='MySpecialCssClass'>
        <Banner />
      </div>
    </div>
  )
}
```

In order to do something like this, you can create a wrapper component like `WrappedBanner` which includes your wrapper div.