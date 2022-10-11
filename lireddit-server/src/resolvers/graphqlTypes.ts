import { InputType, Field } from "type-graphql";

@InputType()
export class UsernamePasswordInput {
    @Field()
    email: string;
    @Field()
    username: string;
    @Field()
    password: string;
}

@InputType()
export class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}
