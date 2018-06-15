import { State, Action, StateContext, NgxsOnInit } from '@ngxs/store';
import { ISideBarModel } from './side-bar.model';
import * as sideBarActions from './side-bar.actions';
import { SideBarService } from '../../services/side-bar.service';
​
@State<ISideBarModel>({
  name: sideBarActions.NAME,
  defaults: <ISideBarModel>{
	  isOpen: true,
	  routes: []
  }
})
export class SideBarState{

	constructor(
		private sideBarService: SideBarService,
	){
	}

	@Action(sideBarActions.Open)
	open(ctx: StateContext<ISideBarModel>) {
		ctx.patchState({
			isOpen: true
		})
	}

	@Action(sideBarActions.Close)
	close(ctx: StateContext<ISideBarModel>){
		ctx.patchState({
			isOpen: false
		})
	}

	@Action(sideBarActions.GetRoutes)
	getRoutes(ctx: StateContext<ISideBarModel>){
		let routes = this.sideBarService.initializeRoutes();
		ctx.patchState({
			routes: routes
		})
	}
}