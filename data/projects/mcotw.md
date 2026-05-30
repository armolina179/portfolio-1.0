---
title: Summitfolk
fullTitle: Mountain Communities of the World
type: Site
status: complete
date: 2025
dates: May 2024 - Jul. 2024
role: Designer & Developer
stack: 'HTML, CSS, JavaScript, Visual Studio Code, GitHub, Vercel'
tools: 'Adobe Creative Suite, Figma'
video: 'https://res.cloudinary.com/drms0y8jz/video/upload/v1767086013/mcotw_ypjupv.mp4'
link: 'https://mountain-communities.vercel.app/#/'
linkLabel: Visit the website
---

## Overview

An interactive educational platform highlighting the cultures, challenges, and resilience of mountain communities worldwide. The site presents data on over one billion people in mountain regions through visual storytelling, an interactive world map, a community carousel, and responsive accessibility throughout. Designed equally for educators, students, and the general public, it is a case study in letting content drive design decisions rather than the other way around. 

Key takeaway: Accessible design is not a constraint, but a discipline that makes everything clearer.

## The Work

The concept evolved from a simple informational site into an interactive exploration platform, built to serve educators, students, and the general public equally.

### Research →

Compiled data on biodiversity, freshwater resources, indigenous languages, and climate change rates across six continents. Featured communities include the Quechua people of the Andes and Sherpa communities of the Himalayas.

### Planning →

Earth-tone palette (sage, clay, rust) reflecting the natural environments represented. Two custom typefaces: Ayr Saturday Night Interlock for display titles, Antique Olive Std for body. Fluid `clamp()` typography throughout.

### Prototyping →

Vanilla JS SPA with hash routing, Slick Carousel for community profiles, GSAP for hero transitions, and a clickable hotspot world map. Full WCAG 2.1 AA implementation including ARIA live regions, keyboard navigation, and reduced-motion support.

### Testing →

Refined contrast ratios, focus indicators, and ARIA labels. Standardized spacing with CSS custom properties and `clamp()` for consistent rhythm across all pages.

### Output →

An educational platform combining photography, video, statistics, and geographic data into a cohesive, accessible experience.

## Reflection

- Building SPA patterns in vanilla JS taught me that complex interactions do not always require heavy frameworks
- Integrating accessibility from the initial design phase rather than retrofitting it produced a noticeably better product overall
- Next: CMS integration for content management, search and filter by region or challenge, and data visualizations for the statistical content
