<script setup lang="ts">
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import {useCharacter} from "~/composables/editing/useCharacter";
import type {WorkspaceBook, WorkspaceCard} from "~/types/maker.types";
import type { TabsItem } from '@nuxt/ui'
import {useConfig} from "~/composables/config/useConfig";
import type {FieldValueType} from "~/types/fields.types";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import * as z from 'zod';
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type {CharacterBook, CharacterBookEntry, TavernCardV2} from "~/types/tavern.types";
import defaultTavernCard from "~/utils/defaults/defaultTavernCard";
import defaultWorkspaceCard from "~/utils/defaults/defaultWorkspaceCard";
import {undefined} from "zod";
import {ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport} from "reka-ui";
import defaultCharacterBook from "~/utils/defaults/defaultCharacterBook";
import defaultWorkspaceBook from "~/utils/defaults/defaultWorkspaceBook";
import {useLorebook} from "~/composables/editing/useLorebook";
import defaultCharacterBookEntry from "~/utils/defaults/defaultCharacterBookEntry";

definePageMeta({
    layout: 'workspace-tabs-layout'
})

const $wk = useWorkspace()
const $bk = useLorebook()
const $cfg = useConfig()
const $qt = useQuickToasts()

const state = reactive<CharacterBook>(defaultCharacterBook())
const saving = ref(false), hasChanges = ref(false), searchEntry = ref('')

const validate = (state: CharacterBook): FormError[] => {
    const errors = []
    if (!state.name) errors.push({ name: 'name', message: 'Required' })
    return errors
}

const book = ref<WorkspaceBook>(defaultWorkspaceBook())
const filteredEntries = computed<CharacterBookEntry[]>({
    get() {
        return state.entries.filter((entry) => {
            return entry.name?.includes(unref(searchEntry))
        })
    },
    set(value: CharacterBookEntry[]) {
        state.entries = value
    }
})

onMounted(() => {
    book.value = {
        ...book.value,
        ...unref($bk.currentBook)
    }

    Object.assign(state, book.value?.book || state)
})

watch([state, book], ([newState, newCard]) => {
    if (newState) {
        book.value.book = state
        hasChanges.value = true
    }

    if (newCard) {
        $bk.writeBook(unref(book).id, unref(book))
        hasChanges.value = true
    }
}, {deep: true})

watchDebounced(hasChanges, (newVal) => {
    if(newVal)
        saveLoreboook().then(r => {
            console.log('saved')
            hasChanges.value = false
        })
}, {debounce: 2000, maxWait: 5000, deep: true})

async function saveLoreboook() {
    saving.value = true
    await $wk.saveWorkspace()
    saving.value = false
}

function addLorebookEntry() {
    state.entries.push(defaultCharacterBookEntry())
}

function backToHome() {
    $bk.backToWorkspace()
}

const _positionSelections = [
    { label: 'Before Character', value: 'before_char' },
    { label: 'After Character', value: 'after_char' },
]
</script>

<template>
    <div>
        <div class="w-full h-full overflow-visible py-2 px-4 my-9">
            <div class="grid grid-cols-7 gap-4 overflow-visible">
                <div class="col-span-2 h-fit top-0 grid grid-cols-1 gap-4">
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
                                <UForm :state :validate class="grid grid-cols-1 gap-4">
                                    <UFormField name="name" required label="Name" size="lg">
                                        <UInput v-model="state.name" class="w-full"/>
                                    </UFormField>
                                    <UFormField name="description" required label="Description" size="lg">
                                        <UTextarea v-model="state.description" class="w-full"/>
                                    </UFormField>
                                </UForm>
                            </div>
                        </template>
                    </UCard>
                    <UCard>
                        <template #header>
                            <div class="w-full flex items-center justify-start gap-2">
                                <UIcon name="lucide:book-open" size="lg"/>
                                <div class="text-lg font-semibold">Settings</div>
                            </div>
                        </template>
                        <template #default>
                            <div class="grid grid-cols-1 gap-4">
                                <UForm :state :validate class="grid grid-cols-1 gap-4">
                                    <UFormField name="scan_depth" label="Scan Depth" description="How many messages back in the chat history to scan for triggers." class="items-center flex gap-2 justify-between">
                                        <UInputNumber v-model="state.scan_depth" :min="0" class="w-full"/>
                                    </UFormField>
                                    <UFormField name="token_budget" label="Token Budget" description="Maximum number of tokens to use for character book entries." class="items-center flex gap-2 justify-between">
                                        <UInputNumber v-model="state.token_budget" :min="0" class="w-full"/>
                                    </UFormField>
                                    <UFormField name="recursive_scanning" label="Recursive Scanning" description="Allow entry content to trigger other entries." class="items-center flex gap-2 justify-between">
                                        <USwitch v-model="state.recursive_scanning" :default-value="state.recursive_scanning == null ? true : state.recursive_scanning" class="justify-self-end"/>
                                    </UFormField>
                                </UForm>
                            </div>
                        </template>
                    </UCard>
                </div>
                <div class="col-span-5 h-full w-full" v-if="book">
                    <UCard>
                        <template #header>
                            <div class="w-full flex items-center justify-start gap-2">
                                <UIcon name="lucide:book-open" size="lg"/>
                                <div class="text-lg font-semibold">Entries</div>
                            </div>
                        </template>
                        <template #default>
                            <div class="w-full grid grid-cols-1 gap-3">
                                <div class="w-full flex items-center justify-center gap-2">
                                    <UInput icon="lucide:search" placeholder="Search for entry..." v-model="searchEntry" class="flex-grow"/>
                                    <div class="flex items-center justify-center gap-2">
                                        <UButton label="Add Entry" icon="lucide:plus" @click="addLorebookEntry()"/>
                                    </div>
                                </div>
                                <USeparator orientation="horizontal"/>
                                <div class="w-full grid grid-cols-1 gap-3">
                                    <template v-if="filteredEntries.length > 0">
                                        <UAccordion
                                            :ui="{
                                                item: 'p-3 rounded-lg border border-default border-b-default last:border-b-[1px] bg-muted',
                                                trigger: 'p-0 font-bold'
                                            }"
                                            v-for="(en, index) in filteredEntries"
                                            :key="index"
                                            :items="[{label: en.name || 'Unnamed Entry', slot: 'fields' as const}]"
                                        >
                                            <template #fields>
                                                <div class="w-full grid-cols-1 gap-2 grid mt-2">
                                                    <div class="w-full grid grid-cols-2 gap-2">
                                                        <UFormField label="Entry Name" size="sm">
                                                            <UInput v-model="en.name" class="w-full" placeholder="Entry Name here..."/>
                                                        </UFormField>
                                                        <UFormField label="Trigger Keys" size="sm">
                                                            <UInputMenu
                                                                v-model="en.keys"
                                                                multiple create-item
                                                                :items="en.keys"
                                                                @create="(n: string) => { en.keys.push(n) }"
                                                                class="w-full"
                                                                placeholder="Entry trigger keys..."
                                                            />
                                                        </UFormField>
                                                        <UFormField label="Priority" size="sm" description="Higher priority entries are kept when token budget is reached.">
                                                            <UInputNumber v-model="en.priority" class="w-full" />
                                                        </UFormField>
                                                        <UFormField label="Position" size="sm" description="Where to place this entry in relation to the character definition.">
                                                            <USelect v-model="en.position" class="w-full" :items="_positionSelections"/>
                                                        </UFormField>
                                                    </div>
                                                    <UFormField label="Entry Content" size="sm" description="The content that will be inserted into the AI's context when this entry is triggered.">
                                                        <UTextarea v-model="en.content" class="w-full" placeholder="Entry Name here..."/>
                                                    </UFormField>
                                                    <UFormField label="Comment" size="sm" description="For your reference only, not used by the AI.">
                                                        <UInput v-model="en.comment" class="w-full"/>
                                                    </UFormField>
                                                    <div class="w-full grid grid-cols-2 gap-3 gap-x-5">
                                                        <UFormField label="Enabled" size="sm" description="Whether this entry is active." class="flex items-center justify-between">
                                                            <USwitch v-model="en.enabled" class="w-full"/>
                                                        </UFormField>
                                                        <UFormField label="Case Sensitive" size="sm" description="Match keys with exact case." class="flex items-center justify-between">
                                                            <USwitch v-model="en.case_sensitive" class="w-full"/>
                                                        </UFormField>
                                                        <UFormField label="Selective Mode" size="sm" description="Require both primary and secondary keys." class="flex items-center justify-between">
                                                            <USwitch v-model="en.selective" class="w-full"/>
                                                        </UFormField>
                                                        <UFormField label="Always Include" size="sm" description="Always include this entry in the context." class="flex items-center justify-between">
                                                            <USwitch v-model="en.constant" class="w-full"/>
                                                        </UFormField>
                                                    </div>
                                                </div>
                                            </template>
                                        </UAccordion>
                                    </template>
                                    <template v-else>
                                        <div class="w-full text-center text-dimmed text-sm">No Entries found.</div>
                                    </template>
                                </div>
                            </div>
                        </template>
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