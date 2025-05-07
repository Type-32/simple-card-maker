<script setup lang="ts">
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import {useCharacter} from "~/composables/editing/useCharacter";
import type {WorkspaceCard} from "~/types/maker.types";
import type { TabsItem } from '@nuxt/ui'
import {useConfig} from "~/composables/config/useConfig";
import type {FieldValueType} from "~/types/fields.types";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";

definePageMeta({
    layout: 'workspace-tabs-layout'
})
const $wk = useWorkspace()
const $ch = useCharacter()
const $cfg = useConfig()
const $qt = useQuickToasts()

const card = ref<WorkspaceCard>()

const activeTab = ref('0')
const descTabs = [
    {
        label: 'Properties',
        description: 'Edit your character description as properties.',
        icon: 'lucide:settings-2',
        slot: 'props' as const
    },
    {
        label: 'Plain Text',
        description: 'Edit your character description in plain text.',
        icon: 'lucide:pen-line',
        slot: 'text' as const
    }
] satisfies TabsItem[]

onMounted(() => {
    card.value = $ch.currentCharacter.value
})

watch(activeTab, (newVal) => {
    if(!card.value) return

    card.value.data.propertiesFormat = newVal == '0'
})


// Safe computed properties
const characterName = computed({
    get: () => card.value?.card.data.name || '',
    set: (value) => {
        if (card.value) {
            card.value.card.data.name = value
        }
    }
})

const characterDescription = computed({
    get: () => card.value?.card.data.description || '',
    set: (value) => {
        if (card.value) {
            card.value.card.data.description = value
        }
    }
})

function addField(field: FieldValueType) {
    if(!card.value) return

    if(card.value.data.descFields.findIndex((value) => value.fieldName.toLowerCase() == field.fieldName.toLowerCase()) != -1){
        $qt.warning("Cannot Add Property", `There is already a property with the same name of ${field.fieldName}.`)
        return;
    }

    card.value.data.descFields.push(field)
}

function removeField(index: number) {
    if (!card.value) return
    card.value.data.descFields.splice(index, 1)
    if (card.value.data.descFields.length === 0) {
        initCardFields()
    }
}


// Initialize with default empty field if no fields exist
function initCardFields() {
    if (card.value && card.value.data.descFields.length === 0) {
        card.value.data.descFields.push({
            fieldName: '',
            fieldValue: '',
            fieldType: 'input'
        })
    }
}

// Handle field value updates with proper typing
function updateFieldValue(index: number, value: string | number | string[]) {
    if (!card.value || !card.value.data.descFields[index]) return
    card.value.data.descFields[index].fieldValue = value
}

function getTemplates() {
    const conf = unref($cfg.makerConfig)
    return conf?.presets.map((value) => {
        return {
            label: value.name,
            onClick() {
                value.fields.forEach((v) => {
                    addField(v)
                })
            }
        }
    })
}
</script>

<template>
    <div>
        <div class="w-full h-full">
            <div class="grid grid-cols-6">
                <div class="col-span-2 h-full">
                    <NuxtImg src="https://picsum.photos/800/600" class="rounded-lg"/>
                </div>
                <div class="col-span-4 h-full w-full" v-if="card">
                    <UFormField label="Name">
                        <UInput v-model="characterName"/>
                    </UFormField>
                    <UFormField label="Description">
                        <UTabs :items="descTabs" v-model="activeTab">
                            <template #props="{ item }">
                                <p class="text-muted text-sm">{{item.description}}</p>
                                <UDropdownMenu
                                    :items="[
                                        [
                                            {label: 'Field', onClick() {addField({fieldName: '', fieldValue: '', fieldType: 'input'})}},
                                            {
                                                label: 'From Template...',
                                                children: getTemplates()
                                            }
                                        ]
                                    ]"
                                >
                                    <UButton size="sm" label="Add Property" icon="lucide:plus"/>
                                </UDropdownMenu>
                                <div v-for="(prop, index) in card.data.descFields">
                                    <div class="flex justify-between items-start mb-2">
                                        <UButton
                                            icon="lucide:trash-2"
                                            color="error"
                                            variant="soft"
                                            size="sm"
                                            @click="removeField(index)"
                                        />
                                        <div class="flex-grow">
                                            <UFormField label="Field Name" class="mb-2">
                                                <UInput v-model="prop.fieldName" placeholder="Enter field name"/>
                                            </UFormField>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 gap-4">
                                        <UFormField label="Field Type">
                                            <USelect
                                                v-model="prop.fieldType"
                                                :options="[
                                                    { value: 'input', label: 'Text Input' },
                                                    { value: 'textarea', label: 'Text Area' },
                                                    { value: 'number', label: 'Number' },
                                                    { value: 'tags', label: 'Tags' }
                                                ]"
                                            />
                                        </UFormField>

                                        <UFormField label="Field Value">
                                            <template v-if="prop.fieldType === 'number'">
                                                <UInputNumber
                                                    :model-value="prop.fieldValue as number"
                                                    @update:model-value="val => updateFieldValue(index, val)"
                                                />
                                            </template>
                                            <template v-else-if="prop.fieldType === 'textarea'">
                                                <UTextarea
                                                    :model-value="prop.fieldValue as string"
                                                    placeholder="Enter text content"
                                                    @update:model-value="val => updateFieldValue(index, val)"
                                                />
                                            </template>
                                            <template v-else-if="prop.fieldType === 'tags'">
                                                <UInputMenu
                                                    :model-value="prop.fieldValue as string[]"
                                                    multiple
                                                    ignore-filter
                                                    placeholder="Add tags"
                                                    :options="Array.isArray(prop.fieldValue) ? prop.fieldValue : []"
                                                    @update:model-value="(val) => {
                                                        updateFieldValue(index, val.map(e => e as string))
                                                    }"
                                                />
                                            </template>
                                            <template v-else>
                                                <UInput
                                                    :model-value="prop.fieldValue as string"
                                                    placeholder="Enter value"
                                                    @update:model-value="val => updateFieldValue(index, val)"
                                                />
                                            </template>
                                        </UFormField>
                                    </div>
                                </div>
                            </template>
                            <template #text="{ item }">
                                <p class="text-muted text-sm">{{item.description}}</p>
                                <UTextarea v-model="characterDescription"/>
                            </template>
                        </UTabs>
                    </UFormField>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>