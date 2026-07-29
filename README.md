# Week 4 — Interactive Chart

A D3 + Svelte chart comparing CO₂ emissions across five countries (China, United
States, India, Russia, Japan) in 2000, 2010, and 2020. Data: [Global Carbon
Project, via Our World in Data](https://ourworldindata.org/co2-emissions).

- **Data state change** — toggle between total emissions and per-capita
  emissions; check/uncheck countries to filter the lines shown
- **Tooltips** — hover any point for its exact value
- **Transitions** — lines fade in/out on both the metric toggle and the
  country filter
- **Responsive** — the chart measures its container with `bind:clientWidth`
  and rescales

## Developing

```sh
npm install
npm run dev
```

Then open the URL Vite prints (chart is on the home page).
