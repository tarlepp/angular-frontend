import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ErrorInterceptor } from 'src/app/shared/interceptors/error.interceptor';
import { AcceptLanguageInterceptor } from 'src/app/shared/interceptors/accept-language.interceptor';

export const HttpInterceptors = [
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true },
];
