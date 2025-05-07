import {type V2, type CharacterBook} from "character-card-utils"
import type {FieldValueType} from "~/types/fields.types";

export type Workspace = {
    id: string,
    name: string,
    cards: WorkspaceCard[],
    books: WorkspaceBook[],
    tree: WorkspaceTree,
}

export type WorkspaceCard = {
    id: string,
    card: V2,
    data: {
        propertiesFormat: boolean, // default should be true.
        descFields: FieldValueType[], // the stored values should not override the TavernCard description field.
        linkedLorebook: string // The linked lorebook ID.
    }
}

export type WorkspaceBook = {
    id: string,
    book: CharacterBook
}

export type WorkspaceTree = {
    cards: WorkspaceDirEntry[] // One for Cards
    books: WorkspaceDirEntry[] // One for books
}

export type WorkspaceDirEntry = {
    folder: boolean
    entryId: string, // the current WorkspaceDirEntry's Unique ID.
    name?: string,
    parentId: string, // refers to the parent WorkspaceDirEntry id.
    referringId: string, // refers to the workspace card or book entry IDs.
    children: WorkspaceDirEntry[]
}