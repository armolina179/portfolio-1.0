---
title: Götaplan
fullTitle: 'Trip Planner: Gothenburg, Sweden'
type: Site
status: complete
date: 2025
dates: Jul. 2025 - Aug. 2025
role: Designer & Developer
supervisor: Licia Bailey
stack: 'HTML, CSS, JavaScript, jQuery / jQuery UI, Leaflet, Magnific Popup, Open-Meteo API, Google Fonts, Visual Studio Code, GitHub'
tools: 'Figma, Photoshop, TouchDesigner'
video: 'https://res.cloudinary.com/drms0y8jz/video/upload/v1767085277/gothfinal1_dzanbg.mp4'
link: 'https://armolina179.github.io/tripplanner/'
linkLabel: Visit the website
---

## Overview

A single-page trip planner for a four-day visit to Gothenburg, Sweden. Built to feel calm and functional during an actual trip, it pairs a tab-based itinerary, interactive Leaflet map, live Open-Meteo weather data, and persistent trip tools into one quiet interface. The project was a deliberate exercise in restraint. Every feature had to earn its place by reducing friction rather than adding novelty. 

Key takeaway: Good utility design is mostly about what you leave out.

## The Work

The guiding principle was designing for calm; reducing decision friction so travelers can move confidently without being overwhelmed.

![Trip Planner wireframe](/retired/projects/tripplanner/assets/tripplanner-wireframe.png)

### Research →

Mapped a realistic four-day arc through Gothenburg and identified the features travelers actually check most: routes, weather, packing, and favorites. Established the planner as an in-the-moment tool rather than a long-form guide.

### Planning →

Chose a tab-based layout with Archivo Black headings and Space Mono body text on an ink-on-off-white palette. Structured trip tools around localStorage for persistence without a backend.

### Prototyping →

jQuery UI tabs for the itinerary, Leaflet and OpenStreetMap for the map, Open-Meteo for live weather data, and Magnific Popup for the photo gallery. Defensive parsing and default resets kept localStorage reliable across sessions.

### Testing →

Simplified packing list interactions after early testers found the delete flow unclear. Refined map marker contrast on island pins and ran an accessibility pass with axe.

### Output →

A fast, practical travel companion that turns travel planning into a set of small, decisive components — something I would genuinely open during a trip.

## Reflection

- Managing CDN load order and plugin bindings built my confidence working with third-party dependencies
- This project developed my intuition around scannability and information hierarchy in UI design
- Next: live ferry times from Västtrafik, PDF/iCal export, and a potential migration to React or Svelte
