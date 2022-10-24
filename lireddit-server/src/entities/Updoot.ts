import "reflect-metadata";
import { Entity, BaseEntity, PrimaryColumn, Column, ManyToOne } from "typeorm";

import { User } from "./User";
import { Post } from "./Post";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
    @Field()
    @Column({ type: "int" })
    value: number;

    @Field()
    @PrimaryColumn()
    userId: number;

    @Field()
    @PrimaryColumn()
    postId: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.updoots)
    user: User;

    @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.updoots)
    post: Post;
}
