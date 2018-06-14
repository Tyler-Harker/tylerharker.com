import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { SideBarState } from './store/side-bar/side-bar.state';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';


@NgModule({
  declarations: [
    SideBarComponent
  ],
  imports: [
    BrowserModule,
    NgxsModule.forFeature([
      SideBarState
    ]),
  ],
  exports: [
    SideBarComponent
  ],
  providers: [],
  bootstrap: []
})
export class LayoutModule { }
