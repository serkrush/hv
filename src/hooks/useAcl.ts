import Guard from "@/acl/Guard";
import { GRANT, IIdentity, ROLE } from "@/acl/types";
import { AppState } from "../constants";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { useEffect } from "react";

interface IUseAclResult {
    allow: (grant?: GRANT, res?: string, role?: ROLE) => boolean;
    isItMe: (userId: string, slug?: string) => boolean;
    identity: IIdentity;
    pathname: string;
    query: ParsedUrlQuery;
}

export const useAcl = (): IUseAclResult => {
    const { replace, pathname, query } = useRouter();

    let resource = pathname.replace(/\./g, "_");
    const id = query?.id?.toString();
    if (id) {
        resource = resource.replace("[id]", id);
    }

    const auth = useSelector((state: AppState) => state.auth);
    const { roles, rules, identity } = auth;
    const guard = new Guard(roles, rules);
    guard.build(identity);
    if (!guard.allow(GRANT.READ, resource)) {
        console.log("error resource", resource);
        replace("/error/403");
    }
    

    return {
        allow: (grant: GRANT, res: string = null, role: ROLE = null) => {
            const r = res ? res : resource;
            return guard.allow(grant, r, null, role);
        },
        isItMe: (userId: string, slug?: string) => {
            return identity.userId === userId;
        },
        identity,
        pathname,
        query,
    };
};
