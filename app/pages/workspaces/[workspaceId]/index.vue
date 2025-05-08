<script setup lang="ts">
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import type {TabsItem} from "@nuxt/ui";
import {WorkspaceModalRenameWorkspace, CharacterModalCreateCharacter, LorebookModalCreateLorebook} from "#components";

definePageMeta({
    layout: 'workspace-tabs-layout'
})

const contentTabs = ref<TabsItem[]>([
    {
        label: 'Characters',
        slot: 'characters' as const
    },
    {
        label: 'Lorebooks',
        slot: 'lorebooks' as const
    }
])

const $wk = useWorkspace()
const $ovl = useOverlay()

const renameModal = $ovl.create(WorkspaceModalRenameWorkspace)
const createCharModal = $ovl.create(CharacterModalCreateCharacter)
const createLorebookModal = $ovl.create(LorebookModalCreateLorebook)
</script>

<template>
    <div>
        <div class="w-full h-full grid grid-cols-1 px-10 py-5">
            <div class="flex items-center w-full justify-between mb-6">
                <div class="flex flex-col items-start justify-center select-none group">
                    <UButton variant="link" label="Home" icon="lucide:arrow-left" size="xs" class="text-muted" to="/"/>
                    <div class="text-2xl font-bold flex items-center justify-start gap-1">
                        <div class="select-none">{{unref($wk.loadedWorkspace)?.name}}</div>
                        <UButton
                            size="xs"
                            variant="ghost"
                            icon="lucide:pen"
                            class="text-muted group-hover:visible invisible opacity-0 group-hover:opacity-100 transition duration-300"
                            @click="renameModal.open()"
                        />
                    </div>
                    <small class="text-sm text-muted select-none">Workspace of your characters and lorebooks.</small>
                </div>
                <div>
                    <UDropdownMenu
                        :items="[
                            [
                                {label: 'Character', icon: 'lucide:user', onSelect() { createCharModal.open() }},
                                {label: 'Lorebook', icon: 'lucide:book-marked', onSelect() { createLorebookModal.open() }}
                            ]
                        ]"
                    >
                        <UButton label="New..." icon="lucide:plus"/>
                    </UDropdownMenu>
                </div>
            </div>
            <div class="w-full h-full">
                <UTabs :items="contentTabs" variant="link">
                    <template #characters="{ item }">
                        <div class="w-full grid grid-cols-3 gap-4 mt-5" v-if="unref($wk.loadedWorkspace)?.cards.length || 0 > 0">
                            <UCard
                                v-for="(w, index) in unref($wk.loadedWorkspace)?.cards"
                                :key="index"
                                :ui="{
                                    footer: 'p-3 sm:p-3',
                                    body: 'p-4 sm:p-4'
                                }"
                                variant="subtle"
                            >
                                <template #default>
                                    <div class="flex flex-col items-center justify-center gap-2">
                                        <UAvatar :alt="w.card.data.name || 'Unknown Character'" class="size-32"/>
                                        <strong class="text-lg font-medium">{{w.card.data.name || 'Unknown Character'}}</strong>
                                    </div>
                                </template>
                                <template #footer>
                                    <div class="items-center flex justify-between">
                                        <UButton size="sm" icon="lucide:pen-line" label="Edit" @click="$wk.directToCharacter(w.id)"/>
                                        <UDropdownMenu
                                            :items="[
                                                [
                                                    {label: 'Rename', icon: 'lucide:pen'}
                                                ],
                                                [
                                                    {label: 'Delete', color: 'error', icon: 'lucide:trash-2'}
                                                ]
                                            ]"
                                        >
                                            <UButton size="sm" variant="ghost" icon="lucide:ellipsis"/>
                                        </UDropdownMenu>
                                    </div>
                                </template>
                            </UCard>
                        </div>
                        <div class="w-full p-5 grid grid-rows-1 mt-5" v-else>
                            <div class="text-center text-muted text-sm">No Character Cards in this Workspace.</div>
                        </div>
                    </template>
                    <template #lorebooks="{ item }">

                    </template>
                </UTabs>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>