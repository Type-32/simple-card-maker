<script setup lang="ts">
import {useMaker} from "~/composables/maker/useMaker";
import {useConfig} from "~/composables/config/useConfig";
import {WorkspaceModalCreateWorkspace, WorkspaceModalRecentWorkspaces} from "#components";

onMounted(async () => {
    await $cfg.loadConfig()
    loading.value = false
})

const $maker = useMaker()
const $ovl = useOverlay()
const $cfg = useConfig()

const loading = ref(true)

const createWorkspaceModal = $ovl.create(WorkspaceModalCreateWorkspace)
const recentWorkspacesModal = $ovl.create(WorkspaceModalRecentWorkspaces)

</script>
<template>
    <div>
        <div class="flex flex-col items-center justify-center gap-4 h-screen">
            <div class="grid-cols-1 gap-4 grid" v-if="!loading">
                <UButton variant="soft" @click="createWorkspaceModal.open()" label="New Workspace" icon="lucide:plus"/>
                <UButton variant="soft" @click="recentWorkspacesModal.open()" label="Recently Edited..." icon="lucide:history"/>
            </div>
            <div class="text-center text-sm text-dimmed" v-else>Loading Configuration...</div>
        </div>
    </div>
</template>