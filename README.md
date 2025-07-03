# SCALES-OKN Website

A static Eleventy v3 site. Grown out of Rosemary's personal boilerplate, descended from [11ty-no-style-please](https://github.com/stopnoanime/11ty-no-style-please).

Using Nunjucks for templating and LightningCSS for styling. Page editing is structured with a minimalist block idiom.

---

## Development Setup

1. Clone down the respository
2. Check your `node` and `npm` versions against the engines specified in `package.json`
3. Install packages with `npm install`
4. Start the dev server with `npm run dev`, or build the site files with `npm run build`

---

## Deployment

This site is built and deployed by [Cloudflare Pages](https://dash.cloudflare.com/389b632025d241d280ec45f45103cd70/pages/view/scales-website). Changes made to the `main` branch will be built immediately (takes ~30 seconds), and pull requests to `main` will generate preview deployments.

We use [Sveltia CMS](https://github.com/sveltia/sveltia/) for editing directly on `main`, with a [Cloudflare Worker](https://dash.cloudflare.com/389b632025d241d280ec45f45103cd70/workers/services/view/sveltia-cms-auth/production/metrics) and [GitHub OAuth App](https://github.com/settings/applications/3012231) for authentication.
