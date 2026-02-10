# Gloomhaven Scenario Tree

A visual campaign tracker application for the board game **Gloomhaven**. This tool helps players track their campaign progress, unlocked scenarios, achievements, and treasures via an interactive node-based graph.

![Gloomhaven Scenario Tree](https://raw.githubusercontent.com/angular/angular/master/aio/src/assets/images/logos/angular/angular.png)
*(Note: Replace with actual screenshot if available)*

## Features

- **Interactive Scenario Graph**: Visualization of the entire Gloomhaven scenario tree using [Cytoscape.js](https://js.cytoscape.org/).
- **Campaign Tracking**: Mark scenarios as Incomplete, Complete, Attempted, Locked, or Hidden.
- **Treasure Management**: Track looted treasures for each scenario.
- **State Persistence**: Your campaign progress is automatically saved to your browser's LocalStorage.
- **Import/Export**: detailed JSON import/export functionality to backup your campaign or share it across devices.
- **Context Menu**: Right-click (or long press) nodes to quickly change their status.

## Technology Stack

This project has been migrated to a modern **Angular 18** architecture.

- **Framework**: [Angular 18](https://angular.dev/) (Standalone Components)
- **UI Component Library**: [Angular Material](https://material.angular.io/)
- **Visualization**: [Cytoscape.js](https://js.cytoscape.org/) & [cytoscape-cxtmenu](https://github.com/cytoscape/cytoscape-cxtmenu)
- **Utilities**: [Lodash](https://lodash.com/)

## Getting Started

### Prerequisites

- **Node.js**: Version 18.19.1 or higher (Tested on v18.20.8)
- **NPM**: Version 10 or higher

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/gloomhaven-scenario-tree.git
    cd gloomhaven-scenario-tree
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

### Running Locally

Run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Building for Production

Run the build command to generate the production artifacts:

```bash
ng build
```

The build artifacts will be stored in the `dist/gloomhaven-scenario-tree-ng/` directory.

## Running Tests

Execute the unit tests via [Karma](https://karma-runner.github.io):

```bash
ng test
```

## Migration Notes (Angular 10 -> 18)

This project was recently migrated from a legacy Angular 10 codebase. Key changes include:

- Transitioned to **Standalone Components** API.
- Replaced `TSLint` with modern linting practices.
- Updated `Cytoscape.js` and `Angular Material` to latest compatible versions.
- Strict mode type safety improvements.
