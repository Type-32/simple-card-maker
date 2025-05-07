<script setup lang="ts">

import {useMaker} from "~/composables/maker/useMaker";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import {useConfig} from "~/composables/config/useConfig";
import type {WorkspaceHistory} from "~/types/config.types";
import timeAgo from "~/utils/time/timeAgo";

const $maker = useMaker()
const $qt = useQuickToasts()
const $cfg = useConfig()

const loading = ref(false)

const emit = defineEmits<{ close: [boolean] }>()

function sortWorkspaceHistoryByRecent(history: WorkspaceHistory[]): WorkspaceHistory[] {
    return [...history].sort((a, b) => {
        // Convert dates to timestamps for comparison
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()

        // Sort in descending order (newest first)
        return timeB - timeA
    })
}

onMounted(() => {
    history.value = sortWorkspaceHistoryByRecent(unref($cfg.makerConfig)?.bufferHistory || []) || []
})

async function openWorkspace(workspaceId: string) {
    loading.value = true
    await $maker.openWorkspaceFromBuffer(workspaceId)
    loading.value = false
    emit('close', true)
}

async function clearHistory() {
    loading.value = true
    await $cfg.clearWorkspaceBufferHistory()
    loading.value = false
}

const history = ref<WorkspaceHistory[]>([])
</script>

<template>
    <UModal
        :close="{ onClick: () => emit('close', false) }"
        title="Recently Edited Workspaces"
    >
        <template #body>
            <div class="w-full h-full grid grid-cols-1">
                <UButton :loading v-for="(his, index) in history" variant="ghost" class="justify-between" :key="index" @click="openWorkspace(his.workspaceId)">
                    <div>{{his.workspaceName}}</div>
                    <UBadge :label="timeAgo(his.timestamp)" variant="outline"/>
                </UButton>
            </div>
        </template>
        <template #footer>
            <div class="w-full flex justify-between items-center">
                <UButton variant="outline" label="Clear History" @click="clearHistory()" :loading/>
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>