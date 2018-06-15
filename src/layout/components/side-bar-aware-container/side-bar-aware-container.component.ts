import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ISideBarModel } from '../../store/side-bar/side-bar.model';
import { SideBarState } from '../../store/side-bar/side-bar.state';

@Component({
  selector: 'th-side-bar-aware-container',
  templateUrl: './side-bar-aware-container.component.html',
  styleUrls: ['./side-bar-aware-container.component.scss']
})
export class SideBarAwareContainerComponent {
	@Select(SideBarState) public sideBarState: Observable<ISideBarModel>;
}
