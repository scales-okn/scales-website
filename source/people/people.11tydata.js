const colors = ['forest', 'lime', 'orange', 'pink', 'purple', 'teal', 'navy', 'yellow']
// some silly functions to pick color combiations based on names

export default {
    permalink: function ({ name, page }) {
      return `who-we-are/${this.slugify(name)}/`;
    },
    eleventyComputed: {
      title: data => data.name,
      layout: data => data.layout || "person.njk",
      groundColor: 'black',
      accentColor: ({name}) => colors[name.codePointAt(Math.floor(name.length / 3)) % colors.length]
    }
};