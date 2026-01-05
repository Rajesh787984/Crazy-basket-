import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(FormsModule, ReactiveFormsModule),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),

    provideFirebaseApp(() =>
      initializeApp(environment.firebaseConfig)
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ]
};
