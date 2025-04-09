export default {
    eleventyComputed: {
      title: data => data.name,
      layout: data => data.layout || "person.njk"
    }
};