import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Role } from 'src/app/auth/enums';
import { RoleBaseGuard } from 'src/app/auth/guards/role-base.guard';
import { AuthenticationState } from 'src/app/store/store-states';

@Injectable()
export class RoleAdminGuard extends RoleBaseGuard implements CanActivate, CanActivateChild {
  public constructor(protected authenticationStore: Store<AuthenticationState>) {
    super(authenticationStore);
  }

  /**
   * Purpose of this guard is to check that user has `Role.ROLE_ADMIN` or not.
   * This method is used within route definition `canActivate` definition.
   */
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkRole(Role.ROLE_ADMIN);
  }

  /**
   * Purpose of this guard is to check that user has `Role.ROLE_ADMIN` or not.
   * This method is used within route definition `canActivateChild` definition.
   */
  public canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkRole(Role.ROLE_ADMIN);
  }
}
