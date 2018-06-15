import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ISideBarModel } from '../../store/side-bar/side-bar.model';
import { SideBarState } from '../../store/side-bar/side-bar.state';

import * as sideBarActions from '../../store/side-bar/side-bar.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'th-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
	@Select(SideBarState) public state: Observable<ISideBarModel>;

	constructor(
		private store: Store,
		private router: Router
	){
		this.store.dispatch(new sideBarActions.GetRoutes())
	}


	open(){
		this.store.dispatch(new sideBarActions.Open());
	}
	close(){
		this.store.dispatch(new sideBarActions.Close());
	}
}
