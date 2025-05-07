import type {Workspace, WorkspaceTree} from "~/types/maker.types";
import {useUUID} from "~/composables/utility/useUUID";

export default function (data?: Partial<Workspace>): Workspace {
    return {
        id: data?.id || useUUID(),
        name: data?.name || 'Untitled Workspace',
        books: data?.books || [],
        cards: data?.cards || [],
        tree: {
            books: [],
            cards: [],
        } satisfies WorkspaceTree
    } satisfies Workspace
}