<script setup lang="ts">

import {useMaker} from "~/composables/maker/useMaker";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";

const $maker = useMaker()
const $qt = useQuickToasts()

const emit = defineEmits<{ close: [boolean] }>()
const name = ref('')
const loading = ref(false)

async function createNewWorkspace() {
    loading.value = true
    const newId = await $maker.createWorkspaceToBuffer(name.value)
    await $maker.openWorkspaceFromBuffer(newId)
    loading.value = false
    $qt.success("Created New Workspace!")
    emit('close', true)
}
</script>

<template>
    <UModal
        :close="{ onClick: () => emit('close', false) }"
        title="Create New Workspace"
        :dismissible="!loading"
    >
        <template #body>
            <UFormField label="Workspace Name" required>
                <UInput class="w-full" v-model="name" :disabled="loading" autofocus/>
            </UFormField>
        </template>
        <template #footer>
            <div class="flex gap-2">
                <UButton color="neutral" label="Cancel" @click="emit('close', true)" />
                <UButton label="Create" @click="createNewWorkspace()" />
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>