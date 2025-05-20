import {BaseDirectory, join} from "@tauri-apps/api/path"
import {copyFile, exists, mkdir, readDir, readTextFile, remove, writeTextFile} from "@tauri-apps/plugin-fs"
import {useUUID} from "~/composables/utility/useUUID";
import type {Workspace} from "~/types/maker.types";
import {useDirs} from "~/composables/utility/useDirs";

export function useMakerIO(){
    const BUFFER_FOLDER = "workspace_buffer"
    const ASSETS_FOLDER = "assets"
    const WORKSPACE_FILE = "workspace.json"

    async function createWorkspaceBuffer(name: string) {
        await useDirs().initDirs()

        if(!(await exists(BUFFER_FOLDER, {baseDir: BaseDirectory.AppData})))
            await mkdir(BUFFER_FOLDER, {baseDir: BaseDirectory.AppData})

        const workspaceId = useUUID()
        const bufferPath = await join(BUFFER_FOLDER, workspaceId)
        if (await exists(bufferPath, {baseDir: BaseDirectory.AppData})) {
            throw new Error("Aborting Workspace Creation. Somehow this UUID exists.")
        }

        await mkdir(bufferPath, {baseDir: BaseDirectory.AppData, recursive: true})
        await mkdir(await join(bufferPath, ASSETS_FOLDER), {baseDir: BaseDirectory.AppData, recursive: true})

        const workspaceData = {
            id: workspaceId,
            name: name,
            cards: [],
            books: [],
            tree: {
                books: [],
                cards: [],
            },
            assets: [],
        } satisfies Workspace

        await writeTextFile(await join(bufferPath, WORKSPACE_FILE), JSON.stringify(workspaceData), {baseDir: BaseDirectory.AppData})

        return workspaceId
    }

    async function loadWorkspaceFromBuffer(workspaceId: string) {
        let bufferPath = await join(BUFFER_FOLDER, workspaceId)

        if (!(await exists(bufferPath, {baseDir: BaseDirectory.AppData}))) throw new Error("No workspace of ID found")

        const jsonText = await readTextFile(await join(bufferPath, WORKSPACE_FILE), {baseDir: BaseDirectory.AppData})
        return {
            data: JSON.parse(jsonText) as Workspace,
            relativePath: bufferPath
        }
    }

    async function loadWorkspaceFromFile(absolutePath: string) {
        if(!absolutePath.endsWith('.json') || !absolutePath.endsWith('.txt')) throw new Error("Cannot recognize file format.")

        const jsonText = await readTextFile(absolutePath)
        return JSON.parse(jsonText) as Workspace
    }

    async function deleteWorkspacesFromBuffer(workspaceIds: string[]) {
        let bufferPath = BUFFER_FOLDER
        const entries = await readDir(bufferPath, {baseDir: BaseDirectory.AppData})

        for(const id of workspaceIds) {
            if (entries.filter(e => e.name.includes(id)).length > 0) {
                bufferPath = await join(BUFFER_FOLDER, id)
                await remove(bufferPath, {baseDir: BaseDirectory.AppData, recursive: true})
            }
        }
    }

    async function writeWorkspaceToBuffer(workspace: Workspace) {
        const bufferPath = await join(BUFFER_FOLDER, workspace.id)
        if (!(await exists(bufferPath, {baseDir: BaseDirectory.AppData}))) throw new Error("Buffer does not exists for workspace.")
        await writeTextFile(await join(bufferPath, WORKSPACE_FILE), JSON.stringify(workspace), {baseDir: BaseDirectory.AppData})
    }

    async function copyFileToWorkspaceAssetsFolder(workspaceId: string, originFilePath: string) {
        const suffix = originFilePath.split('.')[originFilePath.split('.').length - 1] || ''
        const id = useUUID()

        if(!(await exists(await join(BUFFER_FOLDER, workspaceId, ASSETS_FOLDER), {baseDir: BaseDirectory.AppData})))
            await mkdir(await join(BUFFER_FOLDER, workspaceId, ASSETS_FOLDER), {baseDir: BaseDirectory.AppData})

        const relativePath = await join(BUFFER_FOLDER, workspaceId, ASSETS_FOLDER, `${id}.${suffix}`)
        await copyFile(originFilePath, relativePath, {toPathBaseDir: BaseDirectory.AppData})
        return {
            relativePath: relativePath,
            newFileName: `${id}.${suffix}`,
            newFileId: id,
        }
    }

    return {
        createWorkspaceBuffer,
        loadWorkspaceFromBuffer,
        loadWorkspaceFromFile,
        deleteWorkspacesFromBuffer,
        writeWorkspaceToBuffer,
        copyFileToWorkspaceAssetsFolder
    }
}