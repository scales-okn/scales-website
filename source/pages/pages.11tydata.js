export default {
    permalink: function ({ title, page }) {
      if (page.fileSlug === 'home') return '/';
      return `/${this.slugify(title)}/`;
    },
    eleventyComputed: {
      title: data => data.title || data.page.filePathStem.split('/').pop(),
      layout: data => data.layout || "page.njk",
      menuOrder: data => data.menuOrder || data.title
    }
};