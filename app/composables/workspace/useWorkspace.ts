import type {Workspace} from "~/types/maker.types";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import type {PossiblyRef} from "~/types/utility.types";
import defaultWorkspace from "~/utils/defaults/defaultWorkspace";
import {useMakerIO} from "~/composables/maker/useMakerIO";
import {useUUID} from "~/composables/utility/useUUID";

export function useWorkspace() {
    const $qt = useQuickToasts()
    const $mio = useMakerIO()

    const $loadedWorkspace = useState<Workspace | null>('scm.wksp.loadedWorkspace', () => null)
    const $currentWorkspaceId = computed(() => useRoute().params.workspaceId as string || undefined)

    function directToWorkspace(workspaceId: string) {
        return navigateTo(`/workspaces/${workspaceId}`)
    }

    function redirectIfExists(workspaceId: string) {
        if (unref($loadedWorkspace)?.id == workspaceId) {
            directToWorkspace(workspaceId)
            return true
        }

        return false
    }

    function openWorkspace(data: Workspace, redirect: boolean = false) {
        const wks = unref($loadedWorkspace)

        if (wks?.id == data.id) {
            $qt.info("Add Workspace", `Workspace ${data.name} is already open`)
        } else {
            $loadedWorkspace.value = data
        }

        if(redirect)
            directToWorkspace(data.id)

        return
    }

    function writeWorkspace(data?: Partial<Workspace>) {
        if (!data) return;

        const wks = unref($loadedWorkspace)

        $loadedWorkspace.value = {
            ...defaultWorkspace(),
            ...wks,
            ...data,
            id: wks?.id || useUUID() // Preserve the original ID
        } satisfies Workspace
    }

    async function saveWorkspace() {
        const wks = unref($loadedWorkspace)

        if (!wks) {
            $qt.error("Saving Workspace", `Workspace does not exist.`);
            return;
        }

        try {
            await $mio.writeWorkspaceToBuffer(wks || defaultWorkspace())
        } catch (e: any) {
            $qt.error("Error While Saving Workspace", e.message)
        }
    }

    return {
        directToWorkspace,
        openWorkspace,
        writeWorkspace,
        saveWorkspace,
        redirectIfExists,
        loadedWorkspace: $loadedWorkspace,
    }
}