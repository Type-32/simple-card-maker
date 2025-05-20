import type {WorkspaceCard} from "~/types/maker.types";
import {useUUID} from "~/composables/utility/useUUID";
import defaultTavernCard from "~/utils/defaults/defaultTavernCard";

export default function (ov?: Partial<WorkspaceCard>): WorkspaceCard {
    return {
        id: ov?.id || useUUID(),
        data: {
            descFields: ov?.data?.descFields || [],
            propertiesFormat: ov?.data?.propertiesFormat != undefined ? ov?.data?.propertiesFormat : true,
            exampleMessages: ov?.data?.exampleMessages || [],
        },
        card: defaultTavernCard(ov?.card),
    } satisfies WorkspaceCard
}