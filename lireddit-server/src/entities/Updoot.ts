import "reflect-metadata";
import {
    Entity,
    BaseEntity,
    ManyToMany,
    PrimaryColumn,
    Column,
    ManyToOne,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class Updoot extends BaseEntity {
    @Column({ type: "int" })
    value: number;

    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Post)
    post: Post;
}
