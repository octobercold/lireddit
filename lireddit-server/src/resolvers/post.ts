import "reflect-metadata";
import { Resolver, Query, Arg, Mutation } from "type-graphql";
import { Post } from "../entities/post";

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
    async createPost(@Arg("title") title: string): Promise<Post> {
        //2 sql queries = suboptimal
        return Post.create({ title }).save();
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
