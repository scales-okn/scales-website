# SCALES-OKN Website

A static Eleventy v3 site. Grown out of Rosemary's personal boilerplate, descended from [11ty-no-style-please](https://github.com/stopnoanime/11ty-no-style-please).

Using Nunjucks for templating and LightningCSS for styling. Page editing is structured with a minimalist block idiom.

## Editing

The site has a built-in git-based CMS available at [scales-okn.org/admin](https://scales-okn.org/admin/). Pages, People, and Settings can be edited, added, and deleted from this interface. Page content is built from rearrangeable blocks like "text," "figure," "cards," and "listing." Once saved, edits will trigger a rebuild that takes ~30 seconds to complete.

To grant CMS access to an editor, invite them to the [`scales-okn`](https://github.com/orgs/scales-okn/people) GitHub organization.

## Development Setup

1. Clone down the respository
2. Check your `node` and `npm` versions against the engines specified in `package.json`
3. Install packages with `npm install`
4. Start the dev server with `npm run dev`, or build the site files with `npm run build`

## Deployment

This site is built and deployed by [Cloudflare Pages](https://dash.cloudflare.com/389b632025d241d280ec45f45103cd70/pages/view/scales-website). Changes made to the `main` branch will be built immediately (takes ~30 seconds), and pull requests to `main` will generate preview deployments. Images and media (PDFs etc.) are saved directly in the repository.

We use [Sveltia CMS](https://github.com/sveltia/sveltia/) for editing directly on `main`, with a [Cloudflare Worker](https://dash.cloudflare.com/389b632025d241d280ec45f45103cd70/workers/services/view/sveltia-cms-auth/production/metrics) and [GitHub OAuth App](https://github.com/settings/applications/3012231) for authentication.
