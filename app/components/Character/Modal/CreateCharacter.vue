<script setup lang="ts">
import {useMaker} from "~/composables/maker/useMaker";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui'
import {useWorkspace} from "~/composables/workspace/useWorkspace";

const schema = z.object({
    name: z.string()
})
type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({
    name: undefined
})

const $wk = useWorkspace()
const $qt = useQuickToasts()

const emit = defineEmits<{ close: [boolean] }>()
const loading = ref(false)

async function createNewCharacter(name: string) {
    loading.value = true
    await $wk.newCharacter(name, true)
    loading.value = false
    $qt.success("Created New Character!")
    emit('close', true)
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    await createNewCharacter(event.data.name)
}
</script>

<template>
    <UModal
        :close="{ onClick: () => emit('close', false) }"
        title="Create New Character"
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