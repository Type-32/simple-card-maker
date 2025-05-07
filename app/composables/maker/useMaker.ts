import {useMakerIO} from "~/composables/maker/useMakerIO";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import {open} from "@tauri-apps/plugin-dialog";
import type {Workspace} from "~/types/maker.types";
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import {useConfig} from "~/composables/config/useConfig";

export function useMaker() {
    const $io = useMakerIO()
    const $qt = useQuickToasts()
    const $wk = useWorkspace()
    const $cfg = useConfig()

    async function createWorkspaceToBuffer(name: string) {
        try {

        } catch (e: any) {
            $qt.error("Error While Creating Workspace", e.message)
        }
        const newId: string = await $io.createWorkspaceBuffer(name)
        return newId
    }

    async function openWorkspaceFromBuffer(id?: string) {
        try {
            if(!id) throw new Error('No Workspace ID in buffer is specified.')

            if ($wk.redirectIfExists(id)) return;

            const data: Workspace = (await $io.loadWorkspaceFromBuffer(id)).data
            $wk.openWorkspace(data, true)

            await $cfg.addWorkspaceBufferToHistory(id)
        } catch (e: any) {
            $qt.error("Error While Opening Workspace", e.message)
        }
    }

    async function openWorkspaceFromFile() {
        try {
            const selectedFile = await open({
                title: "Open Workspace File",
                filters: [{
                    name: 'JSON or Text File',
                    extensions: ['json', 'txt']
                }]
            })

            if (!selectedFile)
                return false;

            const data: Workspace = await $io.loadWorkspaceFromFile(selectedFile)
            $wk.openWorkspace(data, true)

            return true;
        } catch (e: any) {
            $qt.error("Error While Opening Workspace", e.message)
        }
    }

    async function saveWorkspaceToBuffer(workspace: Workspace) {
        try {
            await $io.writeWorkspaceToBuffer(workspace)
        } catch (e: any) {
            $qt.error("Error While Saving Workspace to Buffer", e.message)
        }
    }

    return {
        createWorkspaceToBuffer,
        openWorkspaceFromBuffer,
        openWorkspaceFromFile,
        saveWorkspaceToBuffer
    }
}