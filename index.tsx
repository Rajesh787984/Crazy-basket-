
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './src/app.component';
import { appConfig } from './src/app.config';

// This is a 100% Angular application.
// The `bootstrapApplication` function is the modern, standalone way to start an Angular app.
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

// Note: This development environment (AI Studio) uses an `index.tsx` file for all project types,
// but this project's code is pure Angular. It does not contain any React.

// AI Studio always uses an `index.tsx` file for all project types.