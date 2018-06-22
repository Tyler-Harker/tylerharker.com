import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, Route } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { AppComponent } from './app.component';
import { AppRoutingDataModel } from './app-routing-data.model';
import { LayoutComponent } from './pages/layout/layout.component';
import { BlogComponent } from './pages/blog/blog.component';
import { WorkExperienceComponent } from './pages/work-experience/work-experience.component';
import { CodeComponent } from './pages/code/code.component';
import { LandingComponent } from './pages/landing/landing.component';

const routes: Route[] = [
  {
    path: '',
    component: LandingComponent,
    data: <AppRoutingDataModel>{
      showInSideBar: false,
    }
  },
  {
    path: '', component: LayoutComponent,
    children: [
      {
        path: 'about',
        component: AboutComponent,
        data: <AppRoutingDataModel>{
          showInSideBar: true,
          sideBarLabel: 'About',
          sideBarIconClass: 'fal fa-home'
        }
      },
      {
        path: 'projects',
        component: ProjectsComponent,
        data: <AppRoutingDataModel>{
          showInSideBar: true,
          sideBarLabel: 'Projects',
          sideBarIconClass: 'fal fa-flask'
        }
      },
      {
        path: 'code',
        component: CodeComponent,
        data: <AppRoutingDataModel>{
          showInSideBar: true,
          sideBarLabel: 'Code Samples',
          sideBarIconClass: 'fal fa-file-code'
        }
      },
      {
        path: 'work-experience',
        component: WorkExperienceComponent,
        data: <AppRoutingDataModel>{
          showInSideBar: true,
          sideBarLabel: 'Work Experience',
          sideBarIconClass: 'fal fa-toolbox'
        }
      },
      {
        path: 'blog',
        component: BlogComponent,
        data: <AppRoutingDataModel>{
          showInSideBar: true,
          sideBarLabel: 'Blog',
          sideBarIconClass: 'fal fa-comment'
        }
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
