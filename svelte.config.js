import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		// Served from https://<user>.github.io/week-4-interactive-chart, so every
		// internal link/asset needs this prefix baked in at build time.
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/week-4-interactive-chart' : ''
		}
	}
};

export default config;
