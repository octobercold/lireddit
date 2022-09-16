import "reflect-metadata";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import {
    Resolver,
    Query,
    Arg,
    Mutation,
    Ctx,
    UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/post";
import { PostInput } from "./inputTypes";
import { dataSource } from "../dataSource";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(
        @Arg("limit") limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<Post[]> {
        const realLimit = Math.min(50, limit);
        const qb = dataSource
            .getRepository(Post)
            .createQueryBuilder("p")
            .orderBy('"createdAt"', "DESC")
            .take(realLimit);

        if (cursor) {
            qb.where('"createdAt" > :cursor', {
                cursor: new Date(parseInt(cursor)),
            });
        }

        return qb.getMany();
    }

    @Query(() => Post, { nullable: true })
    post(@Arg("id") id: number): Promise<Post | null> {
        return Post.findOneBy({ id: id });
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({ ...input, creatorId: req.session.userId }).save();
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: string
    ): Promise<Post | null> {
        const post = await Post.findOneBy({ id: id });
        if (!post) {
            return null;
        }
        if (typeof title !== "undefined") {
            await Post.update({ id: id }, { title: title });
        }
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg("id") id: number): Promise<boolean> {
        await Post.delete({ id: id });
        return true;
    }
}
