import { DataSource } from "typeorm";
import { Post } from "./entities/post";
import { User } from "./entities/User";

export const dataSource = new DataSource({
    type: "postgres",
    username: "postgres",
    password: "postgres",
    database: "lireddit2",
    logging: true,
    synchronize: true,
    entities: [Post, User],
});
