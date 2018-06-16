import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { AppComponent } from './app.component';
import { AppRoutingDataModel } from './app-routing-data.model';
import { LayoutComponent } from './pages/layout/layout.component';

const routes: Route[] = [
  {
    path: '', component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        data: <AppRoutingDataModel>{
          showInSideBar: true,
          sideBarLabel: 'Home',
          sideBarIconClass: 'fal fa-home'
        }
      },
      {
        path: 'projects',
        component: ProjectsComponent,
        data: <AppRoutingDataModel>{
          showInSideBar: true,
          sideBarLabel: 'Projects',
          sideBarIconClass: 'fal fa-toolbox'
        }
      }
    ]
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
