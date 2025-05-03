import markdownIt from "markdown-it";
import Image from "@11ty/eleventy-img";
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

    // Skip building unpublished pages except during watch/serve
    // https://www.11ty.dev/docs/quicktips/draft-posts/
    eleventyConfig.addGlobalData("eleventyComputed.permalink", function () {
        return (data) => {
            if (data.layout === "page.njk" 
                    && !data.publishPage 
                    && process.env.ELEVENTY_RUN_MODE === 'build') {
                return false;
            }
            return data.permalink;
        };
    });

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
        collection.find(({data}) => data.title === title)
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
            .getFilteredByGlob("source/articles/*.md");
    });

    /* ---
    * Image Plugin
    * https://www.11ty.dev/docs/plugins/image/
    * This is an async shortcode, so it can't be used in a njk macro
    * or normal loop, but does work in an asyncAll or asyncEach loop
    */ 
    eleventyConfig.addPlugin(eleventyImageTransformPlugin);
    eleventyConfig.addShortcode("image", async function (src, alt, classes, sizes, lazy=true) {
        let metadata = await Image(src, {
            widths: [600, 1200, 2000],
            formats: [
                "jpeg", //  0.93s build
                // "avif", // 16.64s build
                "webp", // 1.97s build
            ],
            outputDir: "_site/img/",
        });

        const orientation = (metadata.jpeg[0].width < metadata.jpeg[0].height)
            ? 'portrait'
            : 'landscape'

        // A 10px wide version is created for background placeholder blur.
        // The file itself is not used, but is written to the directory for caching.
        const mini = await Image(src, {
            widths: [10],
            formats: ["png"],
            outputDir: "img/"
        });
        const minidata = fs.readFileSync(`.${mini.png[0].url}`, "base64");

        let imageAttributes = {
            alt: alt || '',
            sizes: sizes || '50vw',
            loading: lazy ? "lazy" : "eager",
            decoding: "async",
            class: classes || '',
            style: `background-image:url(data:image/png;base64,${minidata})`,
            "data-orientation": orientation,
        };

        return Image.generateHTML(metadata, imageAttributes);
    });

    eleventyConfig.addShortcode("imgpath", async function (src) {
        let metadata = await Image(src, {
            widths: [1200],
            formats: ["jpg"],
            outputDir: "_site/img/",
        })

        return metadata.jpeg[0].url
    })

    eleventyConfig.addShortcode("favicon", async function (src) {
        const ico = await Image(src, {
            widths: [32],
            formats: ["png"],
            outputDir: "_site/",
            filenameFormat: () => "favicon.png"
        });

        const touch = await Image(src, {
            widths: [180],
            formats: ["png"],
            outputDir: "_site/",
            filenameFormat: () => "apple-touch-icon.png"
        });

        return `<link rel="icon" href="/favicon.png" sizes="32x32">
            <link rel="apple-touch-icon" href="/apple-touch-icon.png">`
    });

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