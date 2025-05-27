import type {Workspace, WorkspaceBook, WorkspaceCard} from "~/types/maker.types";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import type {PossiblyRef} from "~/types/utility.types";
import defaultWorkspace from "~/utils/defaults/defaultWorkspace";
import {useMakerIO} from "~/composables/maker/useMakerIO";
import {useUUID} from "~/composables/utility/useUUID";
import defaultWorkspaceCard from "~/utils/defaults/defaultWorkspaceCard";
import defaultWorkspaceBook from "~/utils/defaults/defaultWorkspaceBook";
import defaultWorkspaceAssetEntry from "~/utils/defaults/defaultWorkspaceAssetEntry";
import {join} from "@tauri-apps/api/path";
import {type DialogFilter, open, save} from "@tauri-apps/plugin-dialog"
import {useConversions} from "~/composables/editing/utility/useConversions";

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

    function getCharacterCard(characterId: PossiblyRef<string>) {
        return unref($loadedWorkspace)?.cards.find((value) => value.id == unref(characterId))
    }

    function getLorebook(lorebookId: PossiblyRef<string>) {
        return unref($loadedWorkspace)?.books.find((value) => value.id == unref(lorebookId))
    }

    async function uploadAsset(fileFormatFilters?: DialogFilter[]) {
        const wks = unref($loadedWorkspace)
        if (!wks) {
            $qt.error("Uploading Asset", `The Workspace you are trying to upload an asset to does not exist.`);
            return;
        }

        const filePath = await open({
            title: 'Select File to Upload',
            filters: fileFormatFilters
        })

        if (!filePath)
            return;

        const relativeCopiedPath = await $mio.copyFileToWorkspaceAssetsFolder(wks.id, filePath)
        console.log(wks.id, relativeCopiedPath.newFileId)
        const assetEntry = defaultWorkspaceAssetEntry({
            reference: {
                id: relativeCopiedPath.newFileId,
                parentWorkspaceId: wks.id,
            },
            relativePath: relativeCopiedPath.relativePath
        })
        writeWorkspace({
            assets: [
                ...wks.assets,
                assetEntry
            ]
        })

        return assetEntry;
    }

    function directToCharacter(characterId: string) {
        return navigateTo(`/workspaces/${unref($currentWorkspaceId)}/character/${characterId}`)
    }

    function directToLorebook(lorebookId: string) {
        return navigateTo(`/workspaces/${unref($currentWorkspaceId)}/lorebook/${lorebookId}`)
    }

    async function exportCharacter(card: WorkspaceCard, option?: 'v2_json' | 'v2_png' | 'workspace') {
        const tavernCard = useConversions().convertWorkspaceCardToV2Card(card)
        if (!option || option == 'v2_json') {
            const saveDirFile = await save({
                filters: [{
                    name: 'JSON',
                    extensions: ['json']
                }]
            })

            if (!saveDirFile)
                return;

            await $mio.createV2JsonCardToDir(tavernCard, saveDirFile)
        } else if (option == 'v2_png') {
            if (!card.data.coverImageAsset)
                return

            const saveDirFile = await save({
                filters: [{
                    name: 'Image File',
                    extensions: ['png']
                }]
            })

            if (!saveDirFile)
                return;

            await $mio.createV2PngCardToDir(card.data.coverImageAsset, tavernCard, saveDirFile)
        } else {
            const saveDirFile = await save({
                filters: [{
                    name: 'JSON',
                    extensions: ['json']
                }]
            })

            if (!saveDirFile)
                return;

            await $mio.writeTextFileToDir(JSON.stringify(card), saveDirFile)
        }
    }

    async function exportLorebook(book: WorkspaceBook, option?: 'v2_json' | 'workspace') {
        if (!option || option == 'v2_json') {
            const saveDirFile = await save({
                filters: [{
                    name: 'JSON',
                    extensions: ['json']
                }]
            })

            if (!saveDirFile)
                return;

            await $mio.writeTextFileToDir(JSON.stringify(book.book), saveDirFile)
        } else {
            const saveDirFile = await save({
                filters: [{
                    name: 'JSON',
                    extensions: ['json']
                }]
            })

            if (!saveDirFile)
                return;

            await $mio.writeTextFileToDir(JSON.stringify(book), saveDirFile)
        }
    }

    return {
        directToWorkspace,
        openWorkspace,
        writeWorkspace,
        saveWorkspace,
        redirectIfExists,
        newCharacter,
        newLorebook,
        uploadAsset,
        directToCharacter,
        directToLorebook,
        getCharacterCard,
        getLorebook,
        exportCharacter,
        exportLorebook,
        loadedWorkspace: $loadedWorkspace,
        loadedWorkspaceId: $currentWorkspaceId,
    }
}