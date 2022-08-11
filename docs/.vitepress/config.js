const { defineConfig } = require('vitepress')

module.exports = defineConfig({
  title: 'VitePress',
  description: 'Just playing around.',
  themeConfig: {
    nav: [
      { text: 'Admin Guide', link: '/admin/intro' },
      { text: 'Developer Guide', link: '/developer/intro' },
      { text: 'Repo', link: 'https://github.com/yext/studio-prototype' }
    ],
    sidebar: [
      {
        text: 'Admin Guide',
        items: [
          { text: 'Introduction', link: '/admin/intro' },
        ]
      },
      {
        text: 'Developer Guide',
        items: [
          { text: 'Introduction', link: '/developer/intro' },
          { text: 'Folder Structure', link: '/developer/folderStructure' },
          { text: 'Pages', link: '/developer/pages' },
          { text: 'Components', link: '/developer/components' },
          { text: 'Layouts', link: '/developer/layouts' },
          { text: 'Site Settings', link: '/developer/siteSettings' },
        ]
      }
    ]
  }
})