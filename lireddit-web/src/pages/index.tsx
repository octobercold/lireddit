import { NavBar } from "../components/NavBar";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

const Index = () => (
    <>
        <NavBar />
        <div>hello world</div>
    </>
);

export default withUrqlClient(createUrqlClient)(Index);
