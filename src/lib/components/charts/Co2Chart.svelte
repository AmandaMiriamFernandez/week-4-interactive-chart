<script>
	// Real data: Global Carbon Project, via Our World in Data (ourworldindata.org/co2-emissions)
	import * as d3 from 'd3';
	import { fade } from 'svelte/transition';
	import data from '$lib/data/co2-emissions.json';

	// Fixed country order and matching colors, so a color always means the same
	// country even after countries are filtered in/out.
	const countries = ['China', 'United States', 'India', 'Russia', 'Japan'];
	const colors = {
		China: '#2a78d6',
		'United States': '#eb6834',
		India: '#1baf7a',
		Russia: '#eda100',
		Japan: '#e87ba4'
	};
	const years = [2000, 2010, 2020];

	const metrics = {
		totalMt: { label: 'Total emissions', unit: 'Mt CO₂', format: d3.format(',.0f') },
		perCapita: { label: 'Per capita', unit: 't CO₂ / person', format: d3.format('.1f') }
	};

	let metric = $state('totalMt');
	// which countries are currently shown; all on by default
	let visible = $state(Object.fromEntries(countries.map((c) => [c, true])));

	const margin = { top: 24, right: 24, bottom: 32, left: 56 };
	let width = $state(640);
	let height = $state(380);

	// one line of {year, value} pairs per country
	const series = $derived(
		countries.map((country) => ({
			country,
			color: colors[country],
			points: years.map((year) => {
				const row = data.find((d) => d.country === country && d.year === year);
				return { year, value: row[metric] };
			})
		}))
	);

	const visibleSeries = $derived(series.filter((s) => visible[s.country]));

	// y-axis scales off every country's values for the current metric (not just the
	// visible ones), so the axis doesn't jump around when a country is toggled off.
	const yMax = $derived(d3.max(data, (d) => d[metric]));

	const xScale = $derived(
		d3
			.scalePoint()
			.domain(years)
			.range([margin.left, width - margin.right])
			.padding(0.5)
	);

	const yScale = $derived(
		d3
			.scaleLinear()
			.domain([0, yMax])
			.nice()
			.range([height - margin.bottom, margin.top])
	);

	const lineGenerator = $derived(
		d3
			.line()
			.x((d) => xScale(d.year))
			.y((d) => yScale(d.value))
	);

	// tooltip: which point is hovered, plus where to draw the tooltip box
	let hovered = $state(null);
	let chartEl;

	function showTooltip(event, country, color, point) {
		const box = chartEl.getBoundingClientRect();
		hovered = {
			country,
			color,
			year: point.year,
			value: point.value,
			x: event.clientX - box.left,
			y: event.clientY - box.top
		};
	}

	function hideTooltip() {
		hovered = null;
	}
</script>

<div class="controls">
	<div class="toggle" role="group" aria-label="Choose metric">
		{#each Object.entries(metrics) as [key, m] (key)}
			<button type="button" class:active={metric === key} onclick={() => (metric = key)}>
				{m.label}
			</button>
		{/each}
	</div>
</div>

<div class="chart" bind:clientWidth={width} bind:this={chartEl}>
	<svg viewBox="0 0 {width} {height}">
		<!-- y axis: gridlines + value labels, redrawn whenever the metric changes -->
		{#each yScale.ticks(5) as tick (tick)}
			<g class="tick" transform="translate(0,{yScale(tick)})">
				<line x1={margin.left} x2={width - margin.right} />
				<text x={margin.left - 8} text-anchor="end" dominant-baseline="middle">
					{metrics[metric].format(tick)}
				</text>
			</g>
		{/each}

		<!-- x axis: one label per census year -->
		{#each years as year (year)}
			<text
				x={xScale(year)}
				y={height - margin.bottom + 20}
				text-anchor="middle"
				class="year-label"
			>
				{year}
			</text>
		{/each}

		<!-- keying this block on the metric makes the whole set of lines fade
		     out/in together whenever the metric toggle changes -->
		{#key metric}
			<g transition:fade={{ duration: 250 }}>
				{#each visibleSeries as s (s.country)}
					<g transition:fade={{ duration: 250 }}>
						<path d={lineGenerator(s.points)} fill="none" stroke={s.color} stroke-width="2" />
						{#each s.points as point (point.year)}
							<circle
								cx={xScale(point.year)}
								cy={yScale(point.value)}
								r="5"
								fill={s.color}
								stroke="var(--surface, #fcfcfb)"
								stroke-width="2"
							/>
							<!-- bigger, invisible circle so hovering near the dot still works -->
							<circle
								cx={xScale(point.year)}
								cy={yScale(point.value)}
								r="12"
								fill="transparent"
								onpointerenter={(e) => showTooltip(e, s.country, s.color, point)}
								onpointermove={(e) => showTooltip(e, s.country, s.color, point)}
								onpointerleave={hideTooltip}
							/>
						{/each}
					</g>
				{/each}
			</g>
		{/key}
	</svg>

	{#if hovered}
		<div class="tooltip" style="left:{hovered.x}px; top:{hovered.y}px;">
			<div class="tooltip-value">
				{metrics[metric].format(hovered.value)}
				<span class="unit">{metrics[metric].unit}</span>
			</div>
			<div class="tooltip-label">
				<span class="key" style="background:{hovered.color}"></span>
				{hovered.country} · {hovered.year}
			</div>
		</div>
	{/if}
</div>

<div class="legend">
	{#each countries as country (country)}
		<label class="legend-item">
			<input type="checkbox" bind:checked={visible[country]} />
			<svg class="swatch" width="16" height="8" aria-hidden="true">
				<line x1="0" y1="4" x2="16" y2="4" stroke={colors[country]} stroke-width="2" />
			</svg>
			{country}
		</label>
	{/each}
</div>

<style>
	.controls {
		display: flex;
		margin-bottom: 0.75rem;
	}

	.toggle {
		display: inline-flex;
		border: 1px solid #c3c2b7;
		border-radius: 6px;
		overflow: hidden;
	}

	.toggle button {
		font: inherit;
		font-size: 0.85rem;
		padding: 0.4rem 0.75rem;
		background: #fcfcfb;
		color: #52514e;
		border: none;
		cursor: pointer;
	}

	.toggle button + button {
		border-left: 1px solid #c3c2b7;
	}

	.toggle button.active {
		background: #2a78d6;
		color: white;
	}

	.chart {
		position: relative;
		width: 100%;
	}

	svg {
		width: 100%;
		height: auto;
		font-family: system-ui, sans-serif;
		overflow: visible;
	}

	.tick line {
		stroke: #e1e0d9;
	}

	svg text {
		font-size: 11px;
		fill: #898781;
	}

	.year-label {
		font-size: 12px;
	}

	circle {
		cursor: pointer;
	}

	.tooltip {
		position: absolute;
		transform: translate(-50%, -115%);
		pointer-events: none;
		background: #fcfcfb;
		border: 1px solid #c3c2b7;
		border-radius: 6px;
		padding: 0.4rem 0.6rem;
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.12);
		font-family: system-ui, sans-serif;
		white-space: nowrap;
	}

	.tooltip-value {
		font-weight: 600;
		font-size: 0.95rem;
		color: #0b0b0b;
	}

	.tooltip-value .unit {
		font-weight: 400;
		font-size: 0.75rem;
		color: #52514e;
	}

	.tooltip-label {
		font-size: 0.75rem;
		color: #52514e;
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.1rem;
	}

	.key {
		display: inline-block;
		width: 10px;
		height: 2px;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1rem;
		font-family: system-ui, sans-serif;
		font-size: 0.85rem;
		color: #52514e;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
		white-space: nowrap;
	}
</style>
