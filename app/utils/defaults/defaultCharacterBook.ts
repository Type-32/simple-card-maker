import type {CharacterBook} from "~/types/tavern.types";

export default function (ov?: Partial<CharacterBook>): CharacterBook {
    return {
        name: ov?.name || '',
        entries: ov?.entries || [],
        extensions: ov?.extensions || {},
        description: ov?.description || '',
        scan_depth: ov?.scan_depth || 100,
        token_budget: ov?.token_budget,
        recursive_scanning: ov?.recursive_scanning || false,
    } satisfies CharacterBook
}