import {BaseDirectory, join} from "@tauri-apps/api/path"
import {
    copyFile,
    exists,
    mkdir,
    readDir,
    readFile,
    readTextFile,
    remove,
    writeFile,
    writeTextFile
} from "@tauri-apps/plugin-fs"
import {useUUID} from "~/composables/utility/useUUID";
import type {Workspace, WorkspaceAssetReference} from "~/types/maker.types";
import {useDirs} from "~/composables/utility/useDirs";
import type {TavernCardV2} from "~/types/tavern.types";
import {Png} from "~/utils/converts/png-embed";

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

    async function writeTextFileToDir(content: string, absoluteDirPath: string) {
        await writeTextFile(absoluteDirPath, content)
    }

    async function createV2JsonCardToDir(
        v2CardData: TavernCardV2,
        targetAbsoluteDirPath: string,
    ) {
        await writeTextFile(targetAbsoluteDirPath, JSON.stringify(v2CardData))
    }

    async function createV2PngCardToDir(
        sourceAssetReference: WorkspaceAssetReference,
        v2CardData: TavernCardV2,
        targetAbsoluteDirPath: string, // The absolute path to the directory where the new PNG will be saved
        newFileName?: string // Optional: if not provided, generate one
    ) {
        try {
            const sourceImagePath = await join(BUFFER_FOLDER, sourceAssetReference.parentWorkspaceId, ASSETS_FOLDER, sourceAssetReference.id);

            if (!(
                await exists(`${sourceImagePath}.png`, {baseDir: BaseDirectory.AppData}) ||
                await exists(`${sourceImagePath}.jpg`, {baseDir: BaseDirectory.AppData}) ||
                await exists(`${sourceImagePath}.jpeg`, {baseDir: BaseDirectory.AppData}) ||
                await exists(`${sourceImagePath}.webp`, {baseDir: BaseDirectory.AppData}))
            ) {
                throw new Error(`Source image not found at: ${sourceImagePath}`);
            }

            // Read the source image as a binary file (ArrayBuffer)
            const imageArrayBuffer = await readFile(`${sourceImagePath}.png`, {baseDir: BaseDirectory.AppData});

            // Prepare the JSON data (TavernCardV2)
            const characterJsonString = JSON.stringify(v2CardData);

            // Use the Png.Generate utility to embed the JSON
            // The V2 spec often uses "chara" as the keyword. Confirm this.
            const keyword = "chara"; // Or whatever the V2 spec dictates
            const newPngDataUint8Array = Png.Generate(imageArrayBuffer, characterJsonString, keyword);

            // Determine the output file name and path
            const outputFileName = newFileName || `character_card_${sourceAssetReference.id}.png`;
            const outputAbsoluteFilePath = targetAbsoluteDirPath.endsWith('.png') ? targetAbsoluteDirPath : await join(targetAbsoluteDirPath, outputFileName);

            // Write the new PNG data to the target directory
            await writeFile(outputAbsoluteFilePath, newPngDataUint8Array);

            console.log(`V2 PNG Character Card created at: ${outputAbsoluteFilePath}`);
            return {
                filePath: outputAbsoluteFilePath,
                fileName: outputFileName,
            };

        } catch (error) {
            console.error("Error creating V2 PNG card:", error);
            throw error;
        }
    }

    return {
        createWorkspaceBuffer,
        loadWorkspaceFromBuffer,
        loadWorkspaceFromFile,
        deleteWorkspacesFromBuffer,
        writeWorkspaceToBuffer,
        copyFileToWorkspaceAssetsFolder,
        writeTextFileToDir,
        createV2PngCardToDir,
        createV2JsonCardToDir
    }
}