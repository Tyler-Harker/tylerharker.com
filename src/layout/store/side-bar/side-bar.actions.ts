import { Route } from "@angular/router";

export const NAME = "thSideBar"

export class Open {
	static readonly type = `[${NAME}] Open`;
}
export class Close {
	static readonly type = `[${NAME}] Close`;
}

export class GetRoutes {
	static readonly type = `[${NAME}] Get Routes`;
}