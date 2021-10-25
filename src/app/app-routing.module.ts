import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthModule } from 'src/app/auth/auth.module';
import { LandingRoutingModule } from 'src/app/landing/landing-routing.module';
import { OopsComponent } from 'src/app/shared/components';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/landing',
  },
  {
    path: 'oops',
    pathMatch: 'full',
    component: OopsComponent,
  },
  {
    path: 'auth',
    loadChildren: (): Promise<AuthModule> =>
      import('src/app/auth/auth.module').then((module: typeof import('src/app/auth/auth.module')): AuthModule => module.AuthModule),
  },
  {
    path: '**',
    redirectTo: '/landing',
  },
];

@NgModule({
  declarations: [
    OopsComponent,
  ],
  imports: [
    LandingRoutingModule,
    SharedModule,
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ],
})

export class AppRoutingModule { }
