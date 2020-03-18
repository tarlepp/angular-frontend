import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { RouterState, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { AppRoutingModule } from 'src/app/app-routing.module';
import { AppComponent } from 'src/app/app.component';
import { registerLocales } from 'src/app/app.locales';
import { AuthModule } from 'src/app/auth/auth.module';
import { LandingModule } from 'src/app/landing/landing.module';
import {
  ErrorMessageComponent,
  FooterComponent,
  HeaderComponent,
  VersionChangeDialogComponent,
} from 'src/app/shared/components';
import { HttpLoaderFactory } from 'src/app/shared/factories';
import { SharedModule } from 'src/app/shared/shared.module';
import { effects, metaReducers, reducers } from 'src/app/store';
import { environment } from 'src/environments/environment';

registerLocales();

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    ErrorMessageComponent,
    VersionChangeDialogComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AuthModule,
    LandingModule,
    AppRoutingModule,
    SharedModule,
    NgxWebstorageModule.forRoot(),
    StoreRouterConnectingModule.forRoot({
      stateKey: 'router',
      routerState: RouterState.Minimal,
    }),
    StoreModule.forRoot(
      reducers,
      {
        metaReducers,
        runtimeChecks: {
          strictStateSerializability: true,
          strictActionSerializability: true,
          strictStateImmutability: true,
          strictActionImmutability: true,
        },
      },
    ),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([
      ...effects,
    ]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [],
  bootstrap: [
    AppComponent,
  ],
})

export class AppModule { }
