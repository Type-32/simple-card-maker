import {useConfigIO} from "~/composables/config/useConfigIO";
import type {Config, WorkspaceHistory} from "~/types/config.types";
import defaultConfig from "~/utils/defaults/defaultConfig";
import {useWorkspace} from "~/composables/workspace/useWorkspace";

export function useConfig() {
    const $io = useConfigIO()

    const $config = useState<Config | null>(() => null)

    async function loadConfig() {
        $config.value = await $io.loadOrCreateConfig()
    }

    async function saveConfig() {
        await $io.writeToConfig(unref($config) || defaultConfig())
    }

    async function resetConfig() {
        await $io.resetConfig()
    }

    async function addWorkspaceBufferToHistory(workspaceId: string, save: boolean = true) {
        if(!$config.value) return

        await removeWorkspaceBufferFromHistory(workspaceId, false)

        $config.value.bufferHistory.push({
            workspaceId: workspaceId,
            timestamp: new Date(),
            workspaceName: unref(useWorkspace().loadedWorkspace)?.name || 'Unknown Workspace',
        } satisfies WorkspaceHistory)

        if (save)
            await saveConfig()
    }

    async function removeWorkspaceBufferFromHistory(workspaceId: string, save: boolean = true) {
        if (!$config.value) return

        $config.value.bufferHistory = $config.value.bufferHistory.filter(his => his.workspaceId != workspaceId)

        if (save)
            await saveConfig()
    }

    async function clearWorkspaceBufferHistory(save: boolean = true) {
        if (!$config.value) return

        $config.value.bufferHistory = []

        if (save)
            await saveConfig()
    }

    function writeConfig(data: Partial<Config>) {
        $config.value = {
            ...defaultConfig(),
            ...data
        }
    }

    return {
        makerConfig: $config,
        writeConfig,
        loadConfig,
        saveConfig,
        resetConfig,
        addWorkspaceBufferToHistory,
        removeWorkspaceBufferFromHistory,
        clearWorkspaceBufferHistory
    }
}