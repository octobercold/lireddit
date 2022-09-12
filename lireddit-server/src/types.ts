import { IDatabaseDriver, EntityManager, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";
import "express-session";
import { Redis } from "ioredis";

declare module "express-session" {
    export interface SessionData {
        userId: number;
    }
}

export type MyContext = {
    em: EntityManager & EntityManager<IDatabaseDriver<Connection>>;
    req: Request;
    redis: Redis;
    res: Response;
};
