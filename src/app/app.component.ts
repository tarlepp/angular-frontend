import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Store } from '@ngrx/store';
import { LocalStorageService } from 'ngx-webstorage';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';

import { AuthenticationService } from 'src/app/auth/services';
import { UserDataInterface } from 'src/app/auth/interfaces';
import { Language, Viewport } from 'src/app/shared/enums';
import { AuthenticationState, LayoutState } from 'src/app/store/store-states';
import { authenticationActions, layoutActions } from 'src/app/store/store-actions';
import { authenticationSelectors } from 'src/app/store/store-selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit, OnDestroy {
  private loggedIn: boolean;
  private tokenInterval: number;
  private subscription: Subscription;

  /**
   * Constructor of the class, where we DI all services that we need to use
   * within this component and initialize needed properties.
   */
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

  /**
   * A callback method that is invoked immediately after the default change
   * detector has checked the directive's data-bound properties for the first
   * time, and before any of the view or content children have been checked.
   * It is invoked only once when the directive is instantiated.
   */
  public ngOnInit(): void {
    this.setTokenInterval();
    this.initializeLanguage();

    /**
     * Each time `NavigationEnd` event is dispatched from router, we want to
     * scroll browser to top of the page. This basically happens each time user
     * navigates to another route within application.
     */
    this.subscription
      .add(this.router.events
        .pipe(
          filter((event: RouterEvent): boolean => event instanceof NavigationEnd),
          distinctUntilChanged(),
        )
        .subscribe((): void => this.layoutStore.dispatch(layoutActions.scrollToTop())),
      );

    /**
     * We need to reset current token interval and start new one when user
     * logged in to application.
     */
    this.subscription
      .add(this.localStorage
        .observe('token')
        .pipe(filter((value: any): boolean => value !== undefined))
        .subscribe((): void => this.setTokenInterval()),
      );

    /**
     * We need to track user logged in state, within this we have two (2)
     * different scenarios;
     *  1) Authentication service says that user is not logged in, but this
     *     component says that user is logged in. Within this case we need
     *     _always_ logout user.
     *  2) Authentication service says that user is logged in, but this
     *     component says that user is not logged in. Within this case we
     *     need to dispatch `loginSuccess` action.
     */
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

    // Is used logged in to application or not.
    this.subscription
      .add(this.authenticationStore
        .select(authenticationSelectors.loggedIn)
        .subscribe((loggedIn: boolean): boolean => this.loggedIn = loggedIn),
      );

    /**
     * If/when user changes browser size we need to update layout store state
     * to contain proper information about following things;
     *  - viewport (xs, sm, md, lg, xl)
     *  - isMobile
     *  - isTablet
     *  - isDesktop
     */
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

  /**
   * A callback method that performs custom clean-up, invoked immediately
   * before a directive, pipe, or service instance is destroyed.
   */
  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Method to set token interval that is used to check that user is really
   * authenticated and current Json Web Token (JWT) is not expired.
   */
  private setTokenInterval(): void {
    clearInterval(this.tokenInterval);

    this.tokenInterval = window.setInterval((): void => this.checkToken(), 15000);
  }

  /**
   * Method to check if current logged in user token is valid or not. This
   * method is called with interval so that we can actually check the token
   * expiration status properly.
   *
   * If token is not valid logout action is dispatched to `Authentication`
   * store.
   */
  private checkToken(): void {
    this.authenticationService
      .isAuthenticated()
      .pipe(
        take(1),
        filter((authenticated: boolean): boolean => this.loggedIn && !authenticated),
      )
      .subscribe((): void => this.logout(marker('messages.authentication.timeout')));
  }

  /**
   * Helper method to dispatch `logout` event to `Authentication` store.
   */
  private logout(message?: string): void {
    this.authenticationStore.dispatch(authenticationActions.logout({ message }));
  }

  /**
   * Method to initialize used default language with translate service and
   * determine current user language from browser if user has not yet choose
   * language.
   */
  private initializeLanguage(): void {
    this.translateService.setDefaultLang(Language.DEFAULT);

    let language = this.localStorage.retrieve('language');

    if (language === null) {
      language = navigator.language.split('-')[0].toLowerCase();
    }

    this.layoutStore.dispatch(layoutActions.changeLanguage({ language }));
  }
}
