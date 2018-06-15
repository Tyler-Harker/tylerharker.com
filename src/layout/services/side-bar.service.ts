import { Injectable } from "@angular/core";
import { Router, Route } from "@angular/router";
import { AppRoutingDataModel } from "../../app/app-routing-data.model";
import { Store } from "@ngxs/store";
import * as sideBarActions from '../store/side-bar/side-bar.actions';

@Injectable()
export class SideBarService{
	constructor(
		private router: Router,
		private store: Store,
	){
	}

	initializeRoutes(){
		console.log('here i am')
		let routes = this.getAllRoutes(this.router.config).filter((route) => {
			return (<AppRoutingDataModel>route.data) !== null 
				&& (<AppRoutingDataModel>route.data) !== undefined
				&& (<AppRoutingDataModel>route.data).showInSideBar === true
		});
		return routes;
	}

	/*
		returns a list of all routes within the router config. It accomplishes this reccursivly.
	*/
	getAllRoutes(routes: Route[]): Route[]{
		let foundRoutes: Route[] = [];
		if(routes !== undefined){
			foundRoutes = foundRoutes.concat(routes);
			routes.forEach(route => {
				foundRoutes = foundRoutes.concat(this.getAllRoutes(route.children));
			})
		}
		return foundRoutes;
	}
}