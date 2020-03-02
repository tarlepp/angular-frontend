import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Store } from '@ngrx/store';
import { LocalStorageService } from 'ngx-webstorage';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';

import { AuthenticationService } from './auth/services';
import { Language, Viewport } from './shared/enums';
import { AuthenticationState } from './store/authentication/authentication.state';
import { LayoutState } from './store/layout/layout.state';
import { layoutActions } from './store/layout/layout.actions';
import { authenticationActions } from './store/authentication/authentication.actions';
import { authenticationSelectors } from './store/authentication/authentication.selectors';
import { UserDataInterface } from './auth/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit, OnDestroy {
  private loggedIn: boolean;
  private tokenInterval: number;
  private subscription: Subscription;

  public constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private translateService: TranslateService,
    private authenticationStore: Store<AuthenticationState>,
    private authenticationService: AuthenticationService,
    private layoutStore: Store<LayoutState>,
    private mediaObserver: MediaObserver,
  ) {
    this.loggedIn = false;
    this.subscription = new Subscription();
  }

  public ngOnInit(): void {
    this.setTokenInterval();
    this.initializeLanguage();

    this.subscription
      .add(this.router.events
        .pipe(
          filter((event: RouterEvent): boolean => event instanceof NavigationEnd),
          distinctUntilChanged(),
        )
        .subscribe((): void => this.layoutStore.dispatch(layoutActions.scrollToTop())),
      );

    this.subscription
      .add(this.localStorage
        .observe('token')
        .subscribe((value): void => {
          if (value !== undefined) {
            clearInterval(this.tokenInterval);

            this.setTokenInterval();
          }
        }),
      );

    this.subscription
      .add(this.authenticationService
        .getLoggedInUserData()
        .subscribe((userData: UserDataInterface|null): void => {
          if (userData === null && this.loggedIn) {
            this.logout(null);
          } else if (userData !== null && !this.loggedIn) {
            this.authenticationStore.dispatch(authenticationActions.loginSuccess({ userData }));
          }
        }),
      );

    this.subscription
      .add(this.authenticationStore
        .select(authenticationSelectors.loggedIn)
        .subscribe((loggedIn: boolean): boolean => this.loggedIn = loggedIn),
      );

    this.subscription
      .add(this.mediaObserver
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]): boolean => changes.length > 0),
          map((changes: MediaChange[]): MediaChange => changes[0]),
          distinctUntilChanged((prev: MediaChange, curr: MediaChange): boolean => prev.mqAlias === curr.mqAlias),
        )
        .subscribe((mediaChange: MediaChange): void =>
          this.layoutStore.dispatch(layoutActions.changeViewport({ viewport: mediaChange.mqAlias as Viewport })),
        ),
      );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setTokenInterval(): void {
    this.tokenInterval = window.setInterval((): void => this.checkToken(), 15000);
  }

  private checkToken(): void {
    this.authenticationService
      .isAuthenticated()
      .pipe(take(1))
      .subscribe((authenticated: boolean): void => {
        if (this.loggedIn && !authenticated) {
          this.logout(marker('messages.authentication.timout'));
        }
      });
  }

  private logout(message?: string): void {
    this.authenticationStore.dispatch(authenticationActions.logout({ message }));
  }

  private initializeLanguage(): void {
    this.translateService.setDefaultLang(Language.DEFAULT);

    let language = this.localStorage.retrieve('language');

    if (language === null) {
      language = navigator.language.split('-')[0].toLowerCase();
    }

    this.layoutStore.dispatch(layoutActions.changeLanguage({ language }));
  }
}
