import type {TavernCardV2} from "~/types/tavern.types";

export default function (ov?: Partial<TavernCardV2>) {
    return {
        spec: "chara_card_v2",
        spec_version: '2.0',
        data: {
            tags: ov?.data?.tags || [],
            extensions: ov?.data?.extensions || {},
            alternate_greetings: ov?.data?.alternate_greetings || [],
            character_version: ov?.data?.character_version || '',
            creator: ov?.data?.creator || '',
            creator_notes: ov?.data?.creator_notes || '',
            first_mes: ov?.data?.first_mes || '',
            mes_example: ov?.data?.mes_example || '',
            personality: ov?.data?.personality || '',
            post_history_instructions: ov?.data?.post_history_instructions || '',
            scenario: ov?.data?.scenario || '',
            system_prompt: ov?.data?.system_prompt || '',
            name: ov?.data?.name || '',
            description: ov?.data?.description || ''
        }
    } satisfies TavernCardV2
}