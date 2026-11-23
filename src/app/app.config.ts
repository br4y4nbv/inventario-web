import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { LOCALE_ID } from '@angular/core';

import { routes } from './app.routes';

registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {  
  providers: [
    { provide: LOCALE_ID, useValue: 'es-CO' },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};