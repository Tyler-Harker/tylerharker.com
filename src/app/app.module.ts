import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './/app-routing.module';
import { AboutComponent } from './pages/about/about.component';
import { LayoutModule } from '../layout/layout.module';

import * as sideBarActions from '../layout/store/side-bar/side-bar.actions';
import { ProjectsComponent } from './pages/projects/projects.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { BlogComponent } from './pages/blog/blog.component';
import { WorkExperienceComponent } from './pages/work-experience/work-experience.component';
import { CodeComponent } from './pages/code/code.component';
import { LandingComponent } from './pages/landing/landing.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    AboutComponent,
    ProjectsComponent,
    BlogComponent,
    WorkExperienceComponent,
    CodeComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    NgxsModule.forRoot([]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot({
      key: [
        sideBarActions.NAME
      ]
    }),
    NgxsFormPluginModule.forRoot(),
    NgxsRouterPluginModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
