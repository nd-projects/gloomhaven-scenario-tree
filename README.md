# Gloomhaven Scenario Tree

A visual campaign tracker for **Gloomhaven**, allowing you to track progress, unlocked scenarios, and treasures via an interactive node-based graph.

## Features

- **Interactive Scenario Graph**: Visualize the entire Gloomhaven scenario tree.
- **Campaign Tracking**: Mark scenarios as Incomplete, Complete, Attempted, Locked, or Hidden.
- **Treasure Management**: Track looted treasures for each scenario.
- **State Persistence**: Your campaign progress is automatically saved to your browser's LocalStorage.
- **Import/Export**: Detailed JSON import/export functionality to backup your campaign or share it across devices.
- **Context Menu**: Right-click (or long press) nodes to quickly change their status.
- **Responsive Design**: Works on desktop and mobile devices.

## Tech Stack

- **Angular 18** (Standalone Components)
- **Angular Material**
- **Cytoscape.js** for graph visualization

## Quick Start

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Start the app:**

    ```bash
    npm start
    ```

    Open [http://localhost:4200](http://localhost:4200) to view it in the browser.

## Deployment

To deploy the application to GitHub Pages, run the following command:

```bash
npm run ng deploy -- --base-href "https://nd-projects.github.io/gloomhaven-scenario-tree/"
```

This will build the project and push the artifacts to the `gh-pages` branch.
