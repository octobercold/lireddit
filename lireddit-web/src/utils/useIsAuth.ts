import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const [calledPush, setCalledPush] = useState(false);

    const [{ data, fetching }] = useMeQuery();
    const router = useRouter();

    useEffect(() => {
        if (!calledPush && !fetching && !data?.me) {
            let calledPushLatest;
            setCalledPush((latest) => {
                calledPushLatest = latest;
                return latest;
            });
            if (calledPushLatest) return;
            setCalledPush(true);
            router.replace("/login?next=" + router.pathname);
        }
    }, [fetching, data]);
};
