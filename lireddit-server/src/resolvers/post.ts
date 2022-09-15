import "reflect-metadata";
import { MyContext } from "src/types";
import { Resolver, Query, Arg, Mutation, Ctx } from "type-graphql";
import { Post } from "../entities/post";
import { PostInput } from "./inputTypes";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        return Post.find();
    }

    @Query(() => Post, { nullable: true })
    post(@Arg("id") id: number): Promise<Post | null> {
        return Post.findOneBy({ id: id });
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        if (!req.session.userId) {
            throw new Error("not authenticated");
        }
        return Post.create({ ...input, creatorId: req.session.userId }).save();
    }

    @Mutation(() => Post, { nullable: true })
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
