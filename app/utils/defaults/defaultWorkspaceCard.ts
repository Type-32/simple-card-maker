import type {WorkspaceCard} from "~/types/maker.types";
import {useUUID} from "~/composables/utility/useUUID";

export default function (ov?: Partial<WorkspaceCard>): WorkspaceCard {
    return {
        id: ov?.id || useUUID(),
        data: {
            descFields: ov?.data?.descFields || [],
            propertiesFormat: ov?.data?.propertiesFormat != undefined ? ov?.data?.propertiesFormat : true
        },
        card: {
            spec: ov?.card?.spec || "chara_card_v2",
            spec_version: ov?.card?.spec_version || '',
            data: {
                tags: ov?.card?.data.tags || [],
                extensions: ov?.card?.data.extensions || {},
                alternate_greetings: ov?.card?.data.alternate_greetings || [],
                character_version: ov?.card?.data.character_version || '',
                creator: ov?.card?.data.creator || '',
                creator_notes: ov?.card?.data.creator_notes || '',
                first_mes: ov?.card?.data.first_mes || '',
                mes_example: ov?.card?.data.mes_example || '',
                personality: ov?.card?.data.personality || '',
                post_history_instructions: ov?.card?.data.post_history_instructions || '',
                scenario: ov?.card?.data.scenario || '',
                system_prompt: ov?.card?.data.system_prompt || '',
                name: ov?.card?.data.name || '',
                description: ov?.card?.data.description || ''
            }
        }
    } satisfies WorkspaceCard
}