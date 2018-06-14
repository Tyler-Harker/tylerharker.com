import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ISideBarModel } from '../../store/side-bar/side-bar.model';
import { SideBarState } from '../../store/side-bar/side-bar.state';

import * as sideBarActions from '../../store/side-bar/side-bar.actions';

@Component({
  selector: 'th-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
	@Select(SideBarState) public state: Observable<ISideBarModel>;

	constructor(
		private store: Store
	){}

	open(){
		this.store.dispatch(new sideBarActions.Open());
	}
	close(){
		this.store.dispatch(new sideBarActions.Close());
	}
}
