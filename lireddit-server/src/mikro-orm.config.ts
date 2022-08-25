import { ___prod___ } from "./constants";
import { Post } from "./entities/post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        glob: "!(*.d).{js,ts}",
    },
    entities: [Post],
    dbName: "lireddit",
    user: "postgres",
    password: "postgres",
    type: "postgresql",
    debug: !___prod___,
} as Parameters<typeof MikroORM.init>[0];
