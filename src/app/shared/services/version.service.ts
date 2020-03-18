import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { take } from 'rxjs/operators';

import { ServerErrorInterface, VersionInterface } from 'src/app/shared/interfaces';
import { ConfigurationService } from 'src/app/shared/services/configuration-service';

@Injectable()
export class VersionService {
  public constructor(private http: HttpClient) { }

  /**
   * Method to fetch frontend side version information from static JSON file
   * that is generated when application is built. So if this file contains
   * different version than our current `environment.version` we are sure that
   * frontend application has been updated and user hasn't done hard reload
   * after that.
   */
  public fetchFrontendVersion(): Observable<string | ServerErrorInterface> {
    const ts = Math.round((new Date()).getTime() / 1000);

    return new Observable((observer: Observer<string | ServerErrorInterface>): void => {
      this.http
        .get(`/assets/version.json?t=${ ts }`)
        .pipe(take(1))
        .subscribe(
          (data: VersionInterface): void => observer.next(data.version),
          (error: ServerErrorInterface): void => observer.error(error),
          (): void => observer.complete(),
        );
      });
  }

  /**
   * Method to fetch backend side version information from specified API
   * endpoint. This method is just used once when application is initialized.
   *
   * After that point we will dispatch backend version changes from each API
   * endpoint request via specified HTTP interceptor.
   */
  public fetchBackendVersion(): Observable<string | ServerErrorInterface> {
    const ts = Math.round((new Date()).getTime() / 1000);

    return new Observable((observer: Observer<string | ServerErrorInterface>): void => {
      this.http
      .get(`${ConfigurationService.configuration.apiUrl}/version?t=${ ts }`)
      .pipe(take(1))
      .subscribe(
        (data: VersionInterface): void => observer.next(data.version),
        (error: ServerErrorInterface): void => observer.error(error),
        (): void => observer.complete(),
      );
    });
  }
}
