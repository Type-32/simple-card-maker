<script setup lang="ts">
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import {useCharacter} from "~/composables/editing/useCharacter";
import type {WorkspaceCard} from "~/types/maker.types";
import type { TabsItem } from '@nuxt/ui'
import {useConfig} from "~/composables/config/useConfig";
import type {FieldValueType} from "~/types/fields.types";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import * as z from 'zod';
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type {TavernCardV2} from "~/types/tavern.types";
import defaultTavernCard from "~/utils/defaults/defaultTavernCard";
import defaultWorkspaceCard from "~/utils/defaults/defaultWorkspaceCard";
import {undefined} from "zod";
import {ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport} from "reka-ui";

definePageMeta({
    layout: 'workspace-tabs-layout'
})

const $wk = useWorkspace()
const $ch = useCharacter()
const $cfg = useConfig()
const $qt = useQuickToasts()

const state = reactive<TavernCardV2>(defaultTavernCard())
const saving = ref(false), hasChanges = ref(false)

const validate = (state: TavernCardV2): FormError[] => {
    const errors = []
    if (!state.data.name) errors.push({ name: 'name', message: 'Required' })
    return errors
}

const card = ref<WorkspaceCard>(defaultWorkspaceCard())

const categoryTabs = [
    {label: 'Basic Info', slot: 'basic' as const},
    {label: 'Messages', slot: 'msgs' as const},
    {label: 'System', slot: 'system' as const},
    {label: 'Advanced', slot: 'adv' as const},
]



onMounted(() => {
    card.value = {
        ...card.value,
        ...unref($ch.currentCharacter)
    }
    state.data = {
        ...state.data,
        ...card.value?.card.data
    }
})

watch([state, card], ([newState, newCard]) => {
    if (newState) {
        card.value.card = state
        hasChanges.value = true
    }

    if (newCard) {
        $ch.writeCharacterCard(unref(card).id, unref(card))
        hasChanges.value = true
    }
}, {deep: true})

watchDebounced(hasChanges, (newVal) => {
    if(newVal)
        saveCharacter().then(r => {
            console.log('saved')
            hasChanges.value = false
        })
}, {debounce: 2000, maxWait: 5000, deep: true})

// Handle field value updates with proper typing
function updateFieldValue(index: number, value: string | number | string[]) {
    if (!card.value || !card.value.data.descFields[index]) return
    card.value.data.descFields[index].fieldValue = value
}

function onCreateTag(item: string) {
    state.data.tags.push(item)
    state.data.tags = state.data.tags as string[]
}

async function saveCharacter() {
    saving.value = true
    await $wk.saveWorkspace()
    saving.value = false
}

function backToHome() {
    $ch.backToWorkspace()
}
</script>

<template>
    <div>
        <div class="w-full h-full overflow-visible py-2 px-4 my-9">
            <div class="grid grid-cols-7 gap-4 overflow-visible">
                <div class="col-span-2 h-full top-0">
                    <UCard>
                        <template #header>
                            <div class="w-full flex items-center justify-between gap-4">
                                <UButton
                                    label="Back to Workspace"
                                    class="w-full text-muted"
                                    icon="lucide:arrow-left"
                                    @click="backToHome()"
                                    :loading="saving"
                                    variant="link"
                                    size="sm"
                                />
                                <div>
                                    <UTooltip text="Whether your current workspace is saved.">
                                        <UIcon name="lucide:loader-circle" class="text-muted animate-spin" size="sm" v-if="hasChanges"/>
                                        <UIcon name="lucide:check" class="text-muted" size="sm" v-else/>
                                    </UTooltip>
                                </div>
                            </div>
                        </template>
                        <template #default>
                            <div class="grid grid-cols-1 gap-4">
                                <NuxtImg src="https://picsum.photos/800/600" class="rounded-lg"/>
                                <UForm :state :validate class="grid grid-cols-1 gap-4">
                                    <UFormField name="name" required label="Name" size="lg">
                                        <UInput v-model="state.data.name" class="w-full"/>
                                    </UFormField>
                                    <UFormField name="tags" required label="Tags" size="lg">
                                        <UInputMenu multiple create-item :items="state.data.tags" @create="onCreateTag" v-model="state.data.tags" class="w-full"/>
                                    </UFormField>
                                    <UFormField name="creator" required label="Creator" size="lg">
                                        <UInput v-model="state.data.creator" class="w-full"/>
                                    </UFormField>
                                    <UFormField name="version" required label="Version" size="lg">
                                        <UInput v-model="state.data.character_version" class="w-full"/>
                                    </UFormField>
                                </UForm>
                            </div>
                        </template>
                    </UCard>
                </div>
                <div class="col-span-5 h-full w-full" v-if="card">
                    <UCard>
                        <UTabs :items="categoryTabs">
                            <template #basic>
                                <UForm :state :validate class="grid grid-cols-1 gap-4 mt-3">
                                    <UFormField label="Description" description="A detailed description of your character.">
                                        <CharacterCompDescFieldsTabs
                                            :default-properties-format="card.data.propertiesFormat"
                                            v-model="card.data.descFields"
                                            v-model:state-text-desc="state.data.description"
                                            @onUsePropsFormat="(value) => { card.data.propertiesFormat = value }"
                                            class="w-full"
                                        />
                                    </UFormField>
                                    <UFormField label="Personality" description="Describe your character's traits, behaviors, and mannerisms.">
                                        <UTextarea v-model="state.data.personality" class="w-full"/>
                                    </UFormField>
                                    <UFormField label="Scenario" description="The setting or situation where the roleplay takes place.">
                                        <UTextarea v-model="state.data.scenario" class="w-full"/>
                                    </UFormField>
                                </UForm>
                            </template>
                            <template #msgs>
                                <UForm :state :validate class="grid grid-cols-1 gap-4 mt-3">
                                    <UFormField label="First Message" description="This is how your character will introduce themselves.">
                                        <UTextarea v-model="state.data.first_mes" class="w-full"/>
                                    </UFormField>
                                    <UFormField label="Alternate Greetings" description="Additional ways your character might introduce themselves.">
                                        <CharacterCompStringArrayInputs v-model="card.card.data.alternate_greetings" button-text="Add Alternate Greeting"/>
                                    </UFormField>
                                    <UFormField label="Example Messages" description="Example conversation that shows how your character typically responds. <START> tags are added automatically.">
                                        <CharacterCompStringArrayInputs v-model="card.data.exampleMessages" button-text="Add Example Message"/>
                                    </UFormField>
                                </UForm>
                            </template>
                            <template #system>
                                <UForm :state :validate class="grid grid-cols-1 gap-4 mt-3">
                                    <UFormField label="System Prompt" description="Instructions for the AI on how to roleplay your character.">
                                        <UTextarea v-model="state.data.system_prompt" class="w-full"/>
                                    </UFormField>
                                    <UFormField label="Post-History Instructions" description="Instructions for the AI after it has read the conversation history.">
                                        <UTextarea v-model="state.data.post_history_instructions" class="w-full"/>
                                    </UFormField>
                                </UForm>
                            </template>
                            <template #adv>
                                <UForm :state :validate class="grid grid-cols-1 gap-4 mt-3">
                                    <UFormField label="Creator Notes" description="Additional notes about your character that aren't part of their description">
                                        <UTextarea v-model="state.data.creator_notes" class="w-full"/>
                                    </UFormField>
                                </UForm>
                            </template>
                        </UTabs>
                    </UCard>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
@reference "~/assets/css/main.css";

.input-full {
    input {
        @apply w-full flex-grow;
    }
}
</style>