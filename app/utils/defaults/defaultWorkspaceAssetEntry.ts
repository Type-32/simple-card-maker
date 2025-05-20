import type {WorkspaceAssetEntry} from "~/types/maker.types";
import {useUUID} from "~/composables/utility/useUUID";

export default function (ov?: Partial<WorkspaceAssetEntry>): WorkspaceAssetEntry {
    return {
        reference: {
            id: ov?.reference?.id || (useUUID() as string),
            parentWorkspaceId: ov?.reference?.parentWorkspaceId || ''
        },
        relativePath: ov?.relativePath || ''
    } satisfies WorkspaceAssetEntry
}