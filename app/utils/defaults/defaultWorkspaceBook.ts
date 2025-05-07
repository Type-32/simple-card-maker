import type {WorkspaceBook} from "~/types/maker.types";
import {useUUID} from "~/composables/utility/useUUID";
import type {CharacterBook} from "character-card-utils";

export default function (ov?: Partial<WorkspaceBook>): WorkspaceBook {
    return {
        id: ov?.id || useUUID(),
        book: {
            name: ov?.book?.name || '',
            entries: ov?.book?.entries || [],
            extensions: ov?.book?.extensions || {},
            description: ov?.book?.description || '',
            scan_depth: ov?.book?.scan_depth || 100,
            token_budget: ov?.book?.token_budget,
            recursive_scanning: ov?.book?.recursive_scanning,
        } satisfies CharacterBook
    } satisfies WorkspaceBook
}