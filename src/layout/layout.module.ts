import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SideBarComponent } from './components/side-bar/side-bar.component';


@NgModule({
  declarations: [
    SideBarComponent
  ],
  imports: [
    BrowserModule,
    NgxsModule.forFeature([

    ])
  ],
  exports: [
    SideBarComponent
  ],
  providers: [],
  bootstrap: []
})
export class LayoutModule { }
