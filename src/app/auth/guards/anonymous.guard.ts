import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { BaseAuth } from 'src/app/auth/guards/base-auth';
import { AuthenticationService } from 'src/app/auth/services';

@Injectable({
  providedIn: 'root',
})
export class AnonymousGuard extends BaseAuth implements CanActivate, CanActivateChild {
  /**
   * Constructor of the class, where we DI all services that we need to use
   * within this guard.
   */
  public constructor(
    protected readonly router: Router,
    protected readonly authenticationService: AuthenticationService,
  ) {
    super(router, authenticationService);
  }

  /**
   * Purpose of this guard is check that current user has not been authenticated
   * to application. If user is authenticated he/she is redirected to application
   * root.
   *
   * This method is used within route definition `canActivate` definition.
   */
  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean|UrlTree> {
    return this.makeCheck(false, route.data?.authGuardMeta ?? null);
  }

  /**
   * Purpose of this guard is check that current user has not been authenticated
   * to application. If user is authenticated he/she is redirected to application
   * root.
   *
   * This method is used within route definition `canActivateChild` definition.
   */
  public canActivateChild(childRoute: ActivatedRouteSnapshot): Observable<boolean|UrlTree> {
    return this.makeCheck(false, childRoute.data?.authGuardMeta ?? null);
  }
}
