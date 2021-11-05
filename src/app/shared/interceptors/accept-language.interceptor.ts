import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Language } from 'src/app/shared/enums';
import { ConfigurationService } from 'src/app/shared/services';
import { layoutSelectors } from 'src/app/store';

@Injectable()
export class AcceptLanguageInterceptor implements HttpInterceptor {
  private language: Language;

  /**
   * Constructor of the class, where we DI all services that we need to use
   * within this component and initialize needed properties.
   */
  public constructor(
    private readonly store: Store,
  ) {
    this.language = Language.DEFAULT;

    this.store.select(layoutSelectors.selectLanguage).subscribe((language: Language): Language => this.language = language);
  }

  /**
   * Identifies and handles a given HTTP request.
   *
   * Within this we add `Accept-Language` header with user selected language to
   * all requests that are made against our backend - so that backend knows
   * which language to use within that request.
   */
  public intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (httpRequest.url.includes(new URL(ConfigurationService.configuration.apiUrl).host)) {
      const modified = httpRequest.clone({
        setHeaders: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Accept-Language': this.language,
        },
      });

      return next.handle(modified);
    }

    return next.handle(httpRequest);
  }
}
