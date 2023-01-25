module.exports = {
  paths: {
    components: "custom/components/folder/path",
    pages: "custom/pages/folder/path",
  },
  plugins: [
    {
      name: "@yext/sample-component",
      components: [
        "src/components/AceComponent.tsx"
      ],
    },
    {
      default: {
        name: "@yext/sample-component-2",
        components: [
          "src/components/BevComponent.tsx"
        ],
      }
    }
  ]
};
