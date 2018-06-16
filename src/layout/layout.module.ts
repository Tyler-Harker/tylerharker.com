import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { SideBarState } from './store/side-bar/side-bar.state';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { SideBarItemComponent } from './components/side-bar-item/side-bar-item.component';
import { SideBarAwareContainerComponent } from './components/side-bar-aware-container/side-bar-aware-container.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { SideBarService } from './services/side-bar.service';
import { RouterModule } from '@angular/router';
import { PanelComponent } from './components/panel/panel.component';
import { PanelContainerComponent } from './components/panel-container/panel-container.component';
import { ImagePanelComponent } from './components/image-panel/image-panel.component';


@NgModule({
  declarations: [
    SideBarComponent,
    SideBarItemComponent,
    SideBarAwareContainerComponent,
    NavBarComponent,
    PanelComponent,
    PanelContainerComponent,
    ImagePanelComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    NgxsModule.forFeature([
      SideBarState
    ]),
  ],
  exports: [
    SideBarComponent,
    SideBarAwareContainerComponent,
    NavBarComponent,
    PanelComponent,
    PanelContainerComponent,
    ImagePanelComponent
  ],
  providers: [SideBarService],
  bootstrap: []
})
export class LayoutModule { }
