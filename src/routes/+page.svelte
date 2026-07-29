<script>
	import Co2Chart from '$lib/components/charts/Co2Chart.svelte';
</script>

<main class="page">
	<section>
		<h1>Week 4 — Who's driving climate change?</h1>
		<p class="intro">
			China now emits more CO₂ in total than any other country, but the United States and Russia
			still emit far more <em>per person</em>. Toggle between the two views below, and switch
			countries on and off to compare them directly. Data: Global Carbon Project, via
			<a href="https://ourworldindata.org/co2-emissions" target="_blank">Our World in Data</a>.
		</p>
		<Co2Chart />
	</section>
</main>

<style>
	.page {
		max-width: 40rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		font-family: system-ui, sans-serif;
		color: #111;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem;
	}

	.intro {
		color: #555;
		line-height: 1.5;
		margin: 0 0 1.5rem;
	}

	a {
		color: #457b9d;
	}
</style>
