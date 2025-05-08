<script setup lang="ts">
import {useMaker} from "~/composables/maker/useMaker";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui'
import {useWorkspace} from "~/composables/workspace/useWorkspace";

const schema = z.object({
    name: z.string().min(3, 'Must be at least 3 characters')
})
type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({
    name: undefined
})

const $wk = useWorkspace()
const $qt = useQuickToasts()

const emit = defineEmits<{ close: [boolean] }>()
const loading = ref(false)

async function createNewLorebook(name: string) {
    loading.value = true
    await $wk.newLorebook(name, true)
    loading.value = false
    $qt.success("Created New Lorebook!")
    emit('close', true)
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    await createNewLorebook(event.data.name)
}
</script>

<template>
    <UModal
        :close="{ onClick: () => emit('close', false) }"
        title="Create New Lorebook"
        :dismissible="!loading"
    >
        <template #body>
            <UForm :schema :state @submit="onSubmit" class="w-full" :disabled="loading">
                <UFormField label="Name" required name="name">
                    <UInput class="w-full" size="xl" v-model="state.name" autofocus/>
                </UFormField>
            </UForm>
        </template>
    </UModal>
</template>

<style scoped>

</style>