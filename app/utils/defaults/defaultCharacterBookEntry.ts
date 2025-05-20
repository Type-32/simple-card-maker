import type {CharacterBookEntry} from "~/types/tavern.types";

export default function (ov?: Partial<CharacterBookEntry>): CharacterBookEntry {
    return {
        id: ov?.id || 0,
        name: ov?.name || '',
        enabled: ov?.enabled == undefined ? true : ov.enabled,
        comment: ov?.comment || '',
        keys: ov?.keys || [],
        content: ov?.content || '',
        priority: ov?.priority || 100,
        extensions: ov?.extensions || {},
        case_sensitive: ov?.case_sensitive == undefined ? false : ov.case_sensitive,
        constant: ov?.constant == undefined ? false : ov.constant,
        insertion_order: ov?.insertion_order || 100,
        position: ov?.position || "before_char",
        secondary_keys: ov?.secondary_keys || [],
        selective: ov?.selective == undefined ? false : ov.selective,
    } satisfies CharacterBookEntry
}