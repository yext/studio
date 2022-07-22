# Site Settings

Studio supports a global settings file that is located at `src/siteSettings.ts`.
This Site Settings file also receives it's own UI in Studio for Admins to edit the contents of.

It follows the most of the same rules as specifying the props for a component does.
Note that it does not support `initialProps`. We may add support for something similar in the future, though.

```ts
export interface SiteSettings {
  apiKey: string,
  experienceKey: string,
  locale: string,
  experienceVersion: string,
  businessId: number
}

export default {
  apiKey: '2d8c550071a64ea23e263118a2b0680b',
  experienceKey: 'slanswers-hier-facets',
  locale: 'en',
  experienceVersion: 'STAGING',
  businessId: 13323123
} as SiteSettings
```