<script setup lang="ts">
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import type {TabsItem} from "@nuxt/ui";

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
</script>

<template>
    <div>
        <div class="w-full h-full grid grid-cols-1">
            <div class="flex items-center w-full justify-between">
                <div class="flex flex-col items-center justify-start">
                    <h1 class="text-2xl font-bold">{{unref($wk.loadedWorkspace)?.name}}</h1>
                    <small class="text-sm font-light">Workspace of your characters and lorebooks.</small>
                </div>
                <div>
                    <UButton label="Create..." icon="lucide:plus"/>
                </div>
            </div>
            <div class="w-full h-full">
                <UTabs :items="contentTabs">
                    <template #characters="{ item }">
                        <div class="w-full grid grid-cols-3">
                            <UCard>
                                <template #default>
                                    <div>

                                    </div>
                                </template>
                                <template #footer>
                                    <div class="items-center flex justify-end">
                                        <UButton size="sm" variant="ghost" icon="lucide:ellipsis"/>
                                    </div>
                                </template>
                            </UCard>
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