<script setup lang="ts">
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import {useCharacter} from "~/composables/editing/useCharacter";
import type {WorkspaceCard} from "~/types/maker.types";
import type {FormError} from '@nuxt/ui'
import {useConfig} from "~/composables/config/useConfig";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import type {TavernCardV2} from "~/types/tavern.types";
import defaultTavernCard from "~/utils/defaults/defaultTavernCard";
import defaultWorkspaceCard from "~/utils/defaults/defaultWorkspaceCard";
import {useLorebook} from "~/composables/editing/useLorebook";
import {useUUID} from "~/composables/utility/useUUID";

definePageMeta({
    layout: 'workspace-tabs-layout'
})

const $wk = useWorkspace()
const $ch = useCharacter()
const $cfg = useConfig()
const $qt = useQuickToasts()

const state = reactive<TavernCardV2>(defaultTavernCard())
const saving = ref(false), hasChanges = ref(false), imageUrl = ref('https://picsum.photos/800/600')

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

    imageUrl.value = coverImageAssetUrl()
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

function coverImageAssetUrl() {
    return unref(card).data.coverImageAsset != null ? `/api/assets/${unref(card).data.coverImageAsset?.parentWorkspaceId}/${unref(card).data.coverImageAsset?.id}?v=${Date.now()}` : 'https://picsum.photos/800/600'
}

async function setCardImage() {
    try {
        card.value.data.coverImageAsset = await $ch.uploadAndSetCardImage(unref($ch.currentCharacterId))
        imageUrl.value = coverImageAssetUrl()
    } catch (e: any) {
        console.log(e)
        $qt.error('Failed to Upload Image', e)
    }
}

const availableLorebooks = computed(() => (unref($wk.loadedWorkspace)?.books?.map(e => ({
        label: `${e.book.name} (${e.id.substring(0, 5)})` || `Untitled Lorebook (${e.id.substring(0, 5)})`,
        id: e.id,
    })) || [])
)

function jumpToEditLorebook() {
    const link = unref(card).data.linkedLorebook
    if (link == undefined)
        $qt.warning("Please link a lorebook first.")

    $wk.saveWorkspace().then()
    $wk.directToLorebook(link || '')
}

</script>

<template>
    <div>
        <div class="w-full h-full overflow-visible py-2 px-9 my-9">
            <div class="w-full flex items-center justify-between gap-4 mb-4">
                <div class="grid grid-cols-1 gap-1">
                    <UButton
                        label="Back to Workspace"
                        class="w-full text-muted"
                        icon="lucide:arrow-left"
                        @click="backToHome()"
                        :loading="saving"
                        variant="link"
                        size="xs"
                    />
                    <div class="text-2xl font-bold">Editing Character "{{state.data.name}}"</div>
                    <div class="text-muted text-sm">Modify your character.</div>
                </div>
                <div>
                    <UButton :loading="hasChanges" icon="lucide:save" :label="hasChanges ? 'Saving...' : 'Auto-Save'"/>
                </div>
            </div>
            <div class="grid grid-cols-7 gap-4 overflow-visible">
                <div class="col-span-2 h-fit">
                    <div class="sticky top-6">
                        <UCard class="">
                            <template #default>
                                <div class="grid grid-cols-1 gap-4">
                                    <UDropdownMenu :items="[
                                    [{label: 'Upload New Image', icon: 'lucide:upload', onSelect() { setCardImage() }}]
                                ]">
                                        <img :src="unref(imageUrl)" alt="Card" class="rounded-lg object-contain hover:cursor-pointer hover:opacity-90 transition duration-300"/>
                                    </UDropdownMenu>
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
                </div>
                <div class="col-span-5 h-full w-full" v-if="card">
                    <UTabs :items="categoryTabs">
                        <template #basic>
                            <UCard class="mt-2">
                                <UForm :state :validate class="grid grid-cols-1 gap-4">
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
                            </UCard>
                        </template>
                        <template #msgs>
                            <UCard class="mt-2">
                                <UForm :state :validate class="grid grid-cols-1 gap-4">
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
                            </UCard>
                        </template>
                        <template #system>
                            <UCard class="mt-2">
                                <UForm :state :validate class="grid grid-cols-1 gap-4">
                                    <UFormField label="System Prompt" description="Instructions for the AI on how to roleplay your character.">
                                        <UTextarea v-model="state.data.system_prompt" class="w-full"/>
                                    </UFormField>
                                    <UFormField label="Post-History Instructions" description="Instructions for the AI after it has read the conversation history.">
                                        <UTextarea v-model="state.data.post_history_instructions" class="w-full"/>
                                    </UFormField>
                                </UForm>
                            </UCard>
                        </template>
                        <template #adv>
                            <UCard class="mt-2">
                                <UForm :state :validate class="grid grid-cols-1 gap-4">
                                    <UFormField label="Creator Notes" description="Additional notes about your character that aren't part of their description.">
                                        <UTextarea v-model="state.data.creator_notes" class="w-full"/>
                                    </UFormField>
                                    <UFormField label="Linked Lorebook" description="The lorebook linked to your character.">
                                        <div class="flex flex-col w-full justify-center gap-2">
                                            <USelectMenu v-model="card.data.linkedLorebook" :items="availableLorebooks" value-key="id" class="w-full"/>
                                            <div class="space-x-2">
                                                <UButton :disabled="card.data.linkedLorebook == undefined" variant="soft" size="sm" color="error" icon="lucide:x" label="Remove Link" @click="() => {card.data.linkedLorebook = undefined}"/>
                                                <UButton :disabled="card.data.linkedLorebook == undefined" variant="soft" size="sm" icon="lucide:pen" label="Edit Lorebook" @click="jumpToEditLorebook()"/>
                                            </div>
                                        </div>
                                    </UFormField>
                                </UForm>
                            </UCard>
                        </template>
                    </UTabs>
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