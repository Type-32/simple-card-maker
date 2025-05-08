import type {Workspace} from "~/types/maker.types";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import type {PossiblyRef} from "~/types/utility.types";
import defaultWorkspace from "~/utils/defaults/defaultWorkspace";
import {useMakerIO} from "~/composables/maker/useMakerIO";
import {useUUID} from "~/composables/utility/useUUID";
import defaultWorkspaceCard from "~/utils/defaults/defaultWorkspaceCard";
import defaultWorkspaceBook from "~/utils/defaults/defaultWorkspaceBook";

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

    async function newCharacter(name: string, redirect: boolean = false) {
        const temp = defaultWorkspaceCard({
            card: {
                // @ts-ignore
                data: {
                    name: name
                }
            }
        })
        $loadedWorkspace.value?.cards.push(temp)
        await saveWorkspace()

        if (redirect)
            await directToCharacter(temp.id)
    }

    async function newLorebook(name: string, redirect: boolean = false) {
        const temp = defaultWorkspaceBook({
            //@ts-ignore
            book: {
                name: name
            }
        })
        $loadedWorkspace.value?.books.push(temp)
        await saveWorkspace()

        if (redirect)
            await directToLorebook(temp.id)
    }

    function directToCharacter(characterId: string) {
        return navigateTo(`/workspaces/${unref($currentWorkspaceId)}/${characterId}`)
    }

    function directToLorebook(lorebookId: string) {
        return navigateTo(`/workspaces/${unref($currentWorkspaceId)}/${lorebookId}`)
    }

    return {
        directToWorkspace,
        openWorkspace,
        writeWorkspace,
        saveWorkspace,
        redirectIfExists,
        newCharacter,
        newLorebook,
        directToCharacter,
        directToLorebook,
        loadedWorkspace: $loadedWorkspace,
        loadedWorkspaceId: $currentWorkspaceId,
    }
}