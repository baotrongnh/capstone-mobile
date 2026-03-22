import { paths } from "./api";

export type UserDetail = NonNullable<paths["/api/v1/users/{id}"]['get']['responses']['200']['content']['application/json']['data']>