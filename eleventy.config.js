import markdownIt from "markdown-it";
// import Image from "@11ty/eleventy-img";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import browserslist from "browserslist";
import { bundle, browserslistToTargets } from "lightningcss";
import htmlmin from "html-minifier-terser";
import path from 'node:path';
import fs from 'node:fs';

export default function(eleventyConfig) {

    const dev = (process.env.ELEVENTY_RUN_MODE === 'serve' || process.env.ELEVENTY_RUN_MODE === 'watch');

    /* ---
    * Files To Passthrough and Ignore
    */ 
    eleventyConfig.addPassthroughCopy("source/fonts");
    eleventyConfig.addPassthroughCopy("source/icons");
    eleventyConfig.addPassthroughCopy("source/admin");
    eleventyConfig.addPassthroughCopy("source/robots.txt");
    eleventyConfig.addPassthroughCopy("source/_headers");
    eleventyConfig.addPassthroughCopy("source/media/*.pdf");

    eleventyConfig.addGlobalData("thisYear", () => new Date().getFullYear())

    /* ---
    * Markdown Rendering
    */ 
    let markdownOptions = {
        html: true,
        breaks: true,
        linkify: true
    };
    let markdownLib = new markdownIt(markdownOptions);
    const defaultRenderer = function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    //Add div around tables
    markdownLib.renderer.rules.table_open = () => '<div class="table-wrapper">\n<table>\n';
    markdownLib.renderer.rules.table_close = () => '</table>\n</div>';

    markdownLib.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const { attrs } = tokens[idx];
        const href = attrs.find(([attr, value]) => attr === 'href')?.at(1)
        if (href.includes('://') && !href.includes('scales-okn.org')) {
            tokens[idx].attrSet('target', '_blank');
        }
        return defaultRenderer(tokens, idx, options, env, self);
    };

    markdownLib.renderer.rules.heading_open = (tokens, idx) => {
        const { tag } = tokens[idx];
        if (tag === 'h1') return '<h3>';
        if (tag === 'h2') return '<h4>';
        if (tag === 'h3') return '<h5>';
    };
    markdownLib.renderer.rules.heading_close = (tokens, idx) => {
        const { tag } = tokens[idx];
        if (tag === 'h1') return '</h3>';
        if (tag === 'h2') return '</h4>';
        if (tag === 'h3') return '</h5>';
    };

    eleventyConfig.setLibrary("md", markdownLib);

    /* ---
    * Custom Filters
    */
    // Render markdown inside templates (e.g. from frontmatter)
    eleventyConfig.addFilter("markdown", (str) =>
        markdownLib.render(str)
    );

    // Remove extensions from names (e.g. layouts)
    eleventyConfig.addFilter("noext", (str) =>
        str.split('.')[0]
    );

    // Find the first item of a collection that matches the path
    eleventyConfig.addFilter("telepage", (collection, title) =>
        collection.find(({data, fileSlug}) => 
            data.title === title || fileSlug === title
        )
    );

    // Pick a text color for a specified background color keyword
    eleventyConfig.addFilter("contrast", (background) => {
        const darkColors = [
            '',
            'navy',
            'purple',
            'forest',
        ]
        return (darkColors.includes(background)) ? 'white' : 'black'
    }
    );

    /* ---
    * Custom Collections
    */ 
    eleventyConfig.addCollection("public", function (collectionApi) {
        return collectionApi
            .getFilteredByGlob(["source/*.md", "source/pages/*.md"])
            .filter(item => item.data?.publishPage)
            .sort((i, j) => String(i.data.menuOrder).localeCompare(j.data.menuOrder));
    });

    eleventyConfig.addCollection("top", function (collectionApi) {
        return collectionApi
            .getFilteredByGlob("source/pages/*.md")
            .sort((i, j) => String(i.data.menuOrder).localeCompare(j.data.menuOrder));
    });

    eleventyConfig.addCollection("articles", function (collectionApi) {
        return collectionApi
            .getFilteredByGlob("source/articles/*.md");
    });

    eleventyConfig.addCollection("people", function (collectionApi) {
        return collectionApi
            .getFilteredByGlob("source/people/*.md")
            .sort((i, j) => String(i.data.name).localeCompare(j.data.name));
    });

    /* ---
    * Image Plugin
    * https://www.11ty.dev/docs/plugins/image/
    */ 
    eleventyConfig.addPlugin(eleventyImageTransformPlugin);


    /* ---
    * CSS Transpilation, Bundling, and Minification
    * https://robmc.dev/blog/add-css-to-your-eleventy-site/
    */ 
    eleventyConfig.addTemplateFormats("css");
    eleventyConfig.addExtension("css", {
        outputFileExtension: "css",
        compile: async function (_inputContent, inputPath) {
          let parsed = path.parse(inputPath);
          if (parsed.name.startsWith("_")) return;

          let targets = browserslistToTargets(browserslist("> 0.2% and last 3 years"));

          return async () => {
            let { code, map } = await bundle({
              filename: inputPath,
              minify: !dev,
              sourceMap: dev,
              targets,
            });
            return code;
          };
        },
    });

    eleventyConfig.addTransform("htmlmin", function (content) {
        // Skip minifying html in dev mode
        if (dev) return content;

        if ((this.page.outputPath || "").endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
                sortAttributes: true,
                minifyCSS: true, // this targets our style attributes in HTML
            });

            return minified;
        }

        // If not an HTML output, return content as-is
        return content;
    });

    return {
        dir: {
            input: "source",
            output: "_site",
        }
    }
};