import type {FieldValueType} from "~/types/fields.types";

export type Config = {
    bufferHistory: WorkspaceHistory[],
    presets: CardDescFormatPreset[],
    version: 1,
}

export type CardDescFormatPreset = {
    id: string,
    name: string,
    source?: string,
    fields: FieldValueType[]
}

export type WorkspaceHistory = {
    workspaceId: string,
    workspaceName: string,
    timestamp: Date
}