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
    Int,
    FieldResolver,
    Root,
    ObjectType,
    Field,
} from "type-graphql";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { PostInput } from "./graphqlTypes";
import { dataSource } from "../dataSource";

@ObjectType({ isAbstract: true })
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 50);
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;
        const updoot = await Updoot.findOneBy({
            postId: postId,
            userId: userId,
        });

        if (updoot && updoot.value !== realValue) {
            //if user did vote but they want to change their vote
            await dataSource.transaction(async (tm) => {
                //2* realValue to account for previous vote
                await tm.query(
                    `
                    update updoot
                    set value = $1
                    where "postId" = $2 and "userId" = $3
                    `,
                    [realValue, postId, userId]
                );
                await tm.query(
                    `
                    update post
                    set points = points + $1
                    where id = $2;
                    `,
                    [2 * realValue, postId]
                );
            });
        } else if (!updoot) {
            //user did not vote
            await dataSource.transaction(async (tm) => {
                await tm.query(
                    `
                    insert into updoot ("userId", "postId", "value")
                    values ($1,$2,$3);
                    `,
                    [userId, postId, realValue]
                );
                await tm.query(
                    `
                    update post
                    set points = points + $1
                    where id = $2;
                    `,
                    [realValue, postId]
                );
            });
        }

        return true;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
        @Ctx() { req }: MyContext
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const replacements: Array<number | Date | undefined> = [
            realLimitPlusOne,
        ];

        if (req.session.userId) replacements.push(req.session.userId);

        let cursorIdx = 3;

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
            cursorIdx = replacements.length;
        }

        const posts = await dataSource.query(
            `
        select p.*,
        json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'createdAt', u."createdAt",
            'updatedAt', u."updatedAt"
            ) creator,
            ${
                req.session.userId
                    ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
                    : 'null as "voteStatus"'
            }
        from post p
        inner join public.user u on u.id = p."creatorId"
        ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
        order by p."createdAt" DESC
        limit $1
        `,
            replacements
        );

        //console.log("posts: ", posts);

        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }

    @Query(() => Post, { nullable: true })
    post(@Arg("id", () => Int) id: number): Promise<Post | null> {
        return Post.findOne({ where: { id: id }, relations: ["creator"] });
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
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        const post = await Post.findOneBy({ id: id });
        if (!post) {
            return false;
        }
        if (post.creatorId !== req.session.userId) {
            throw new Error("not authorizeed");
        }
        await Updoot.delete({ postId: id });
        await Post.delete({ id: id });
        return true;
    }
}
