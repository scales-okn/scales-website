const colors = ['forest', 'lime', 'orange', 'pink', 'purple', 'teal', 'navy', 'yellow']
// some silly functions to pick color combiations based on names

export default {
    eleventyComputed: {
      title: data => data.name,
      layout: data => data.layout || "person.njk",
      groundColor: ({name}) => colors[(name.codePointAt(Math.floor(name.length / 2))) % colors.length],
      accentColor: ({name}) => colors[((name.codePointAt(Math.floor(name.length / 2)) % colors.length) + name.codePointAt(Math.floor(name.length / 3))) % colors.length]
    }
};