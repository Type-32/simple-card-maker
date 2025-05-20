import type {WorkspaceBook} from "~/types/maker.types";
import {useUUID} from "~/composables/utility/useUUID";
import type {CharacterBook} from "character-card-utils";
import defaultCharacterBook from "~/utils/defaults/defaultCharacterBook";

export default function (ov?: Partial<WorkspaceBook>): WorkspaceBook {
    return {
        id: ov?.id || useUUID(),
        book: defaultCharacterBook(ov?.book)
    } satisfies WorkspaceBook
}