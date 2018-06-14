import { State, Action, StateContext } from '@ngxs/store';
import { ISideBarModel } from './side-bar.model';
import * as sideBarActions from './side-bar.actions';
​
@State<ISideBarModel>({
  name: sideBarActions.NAME,
  defaults: <ISideBarModel>{
	  isOpen: true
  }
})
export class SideBarState {
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
}