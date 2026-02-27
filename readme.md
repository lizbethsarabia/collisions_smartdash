# AI disclosure
AI was used in this assignement to debug, any choices made can be explained throughly.

# Overview

This project is an interactive Smart Dashboard that visualizes vehicle collisions in Seattle so far during the 2026 year(jan-feb). The dashboard integrates a dynamic Mapbox web map with multiple data visualization components built using C3.js.

The goal of this dashboard is to help users explore the spatial distribution and severity of vehicle collisions and understand how patterns change based on map extent and location.

This dashboard visualizes vehicle collisions by severity level.
[link to dashboard](https://lizbethsarabia.github.io/collisions_smartdash/)

# Thematic Map Type

This dashboard uses a proportional symbol map to represent vehicle collision severity.

A proportional symbol map was chosen because:
- Collision data are point-based events
- Each point represents a real-world crash location
- The size of the symbol reflects severity level
- It preserves geographic precision
- It avoids distortion that might occur in choropleth aggregation

# Data Visualization Components

Dynamic Bar Chart(C3.js)
- Displays the count of collisions by severity level
- Updates automatically when the map is panned or zoomed
- Reflects only collisions visible within the current map bounds

Dynamic Collision Counter
- Displays the total number of collisions currently visible
- Updates in real-time as the map extent changes

Pop Up
- Displays key information about each point when clicked on

# Data Sources
Source: [Seattle Open Data Portal](https://data-seattlecitygis.opendata.arcgis.com/datasets/504838adcb124cf4a434e33bf420c4ad_0/explore?filters=eyJNT0REVFRNIjpbMTc2NzI1NDQwMDAwMCwxNzcxOTc3NjAwMDAwXX0%3D&location=47.614571%2C-122.333041%2C11)

Dataset: SDOT Traffic Collisions

Format: GeoJSON

# Tools Used
- Mapbox GL JS – Interactive web mapping
- C3.js – Charting library
- D3.js – Data manipulation (dependency of C3)
- HTML / CSS / JavaScript

- GeoJSON

