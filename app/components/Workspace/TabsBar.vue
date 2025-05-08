<script setup lang="ts">
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import {ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport} from "reka-ui";
import {platform} from '@tauri-apps/plugin-os';
import {useWorkspaceSidebar} from "~/composables/workspace/useWorkspaceSidebar";
import {useCharacter} from "~/composables/editing/useCharacter";
import {useLorebook} from "~/composables/editing/useLorebook";
import type {BreadcrumbItem} from "@nuxt/ui";

const $wk = useWorkspace()
const $ch = useCharacter()
const $lb = useLorebook()
const $sidebar = useWorkspaceSidebar()

const breadcrumbs = computed(() => {
    const items: BreadcrumbItem[] = []
    if (unref($wk.loadedWorkspaceId))
        items.push({
            label: unref($wk.loadedWorkspace)?.name,
            ...(unref($ch.currentCharacterId) ?
                {
                    to: `/workspaces/${unref($wk.loadedWorkspaceId)}`
                } : {}),
            icon: 'lucide:layers',
            slot: 'text' as const
        })

    if (unref($ch.currentCharacterId))
        items.push({
            label: unref($ch.currentCharacter)?.card?.data.name,
            icon: 'lucide:user',
            slot: 'text' as const
        })

    return items
})
</script>

<template>
    <div class="max-w-screen w-full left-0 right-0 top-0 h-fit flex items-center justify-center p-1.5 absolute z-10 bg-transparent select-none" data-tauri-drag-region v-if="unref($wk.loadedWorkspace)">
        <div data-tauri-drag-region class="flex items-center justify-center backdrop-blur-sm rounded-lg bg-default/90 border border-muted z-10">
            <UBreadcrumb size="sm" variant="ghost" :items="breadcrumbs" data-tauri-drag-region>
                <template #separator data-tauri-drag-region>
                    <div class="text-muted text-sm z-10" data-tauri-drag-region>/</div>
                </template>
                <template #text="{ item }">
                    <!--Ignore This. Classic TypeScript annoying errors-->
                    <UButton variant="link" class="text-muted" size="sm" :to="item.to || ''" :label="item.label" :icon="item.icon"/>
                </template>
            </UBreadcrumb>
        </div>
    </div>
</template>

<style scoped>

</style>