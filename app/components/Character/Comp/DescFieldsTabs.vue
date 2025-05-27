<script setup lang="ts">
import type {FieldValueType} from "~/types/fields.types";
import type {FormError, TabsItem} from "@nuxt/ui";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import {useConfig} from "~/composables/config/useConfig";
import type {TavernCardV2} from "~/types/tavern.types";
import {ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport} from "reka-ui";

const $qt = useQuickToasts()
const $cfg = useConfig()

const descFields = defineModel<FieldValueType[]>()
const stateTextDesc = defineModel<string>('stateTextDesc')
const props = defineProps<{
    defaultPropertiesFormat: boolean
}>()
const emit = defineEmits<{
    onUsePropsFormat: [value: boolean]
}>()

const pendingField = reactive<FieldValueType>({
    fieldType: 'textarea',
    fieldName: '',
})

const validatePendingField = (field: FieldValueType): FormError[] => {
    const errors = []
    if (field.fieldName == '') errors.push({ name: 'fieldName', message: 'Required' })
    return errors
}

const activeDescTab = ref(props.defaultPropertiesFormat ? '0' : '1')
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

function getTemplates() {
    const conf = unref($cfg.makerConfig)
    return conf?.presets.map((value) => {
        return {
            label: value.name,
            onClick() {
                value.fields.forEach((v) => {
                    pendingField.fieldName = v.fieldName
                    pendingField.fieldType = v.fieldType
                    addField()
                })
            }
        }
    })
}

watch(activeDescTab, (newVal) => {
    emit('onUsePropsFormat', newVal.includes('0'))
})

function addField() {
    if(!descFields.value) return

    if(descFields.value.findIndex((value) => value.fieldName.toLowerCase() == pendingField.fieldName.toLowerCase()) != -1){
        $qt.warning("Cannot Add Property", `There is already a property with the same name of ${pendingField.fieldName}.`)
        return;
    }

    descFields.value.push({
        fieldName: pendingField.fieldName,
        fieldType: pendingField.fieldType,
    })

    pendingField.fieldName = ''
}

function removeField(index: number) {
    if (!descFields.value) return
    descFields.value.splice(index, 1)
    // if (descFields.value.length === 0) {
    //     initCardFields()
    // }
}

function clearFields() {
    if (!descFields.value) return
    descFields.value = []
}

function moveFieldUp(index: number) {
    if (!descFields.value || index <= 0) return

    const fields = descFields.value
    // Swap current field with the one above it
    const temp = fields[index - 1]
    fields[index - 1] = fields[index] as FieldValueType
    fields[index] = temp as FieldValueType

    // hasChanges.value = true
}

function moveFieldDown(index: number) {
    if (!descFields.value || index >= descFields.value.length - 1) return

    const fields = descFields.value
    // Swap current field with the one below it
    const temp = fields[index + 1]
    fields[index + 1] = fields[index] as FieldValueType
    fields[index] = temp as FieldValueType

    // hasChanges.value = true
}
</script>

<template>
    <UTabs :items="descTabs" v-model="activeDescTab" size="sm" variant="link">
        <template #props="{ item }">
            <p class="text-muted text-xs mb-2">{{item.description}}</p>
            <div class="w-full items-center flex gap-2 mb-4 border border-default p-2 rounded-xl">
                <div class="flex-grow">
                    <UForm class="grid grid-cols-2 gap-2" :state="pendingField" :validate="validatePendingField">
                        <UFormField name="fieldName" size="sm">
                            <UInput size="sm" placeholder="Field Name" v-model="pendingField.fieldName" class="w-full"/>
                        </UFormField>
                        <UFormField size="sm">
                            <USelect v-model="pendingField.fieldType" class="w-full" size="sm" :items="['textarea', 'input', 'number', 'tags']"/>
                        </UFormField>
                    </UForm>
                </div>
                <div class="flex items-center gap-1">
                    <UButton icon="lucide:plus" @click="addField" size="sm" variant="soft" label="Add Field"/>
                    <UDropdownMenu
                        :items="[
                            [{label: 'Use Templates...', icon: 'lucide:copy-plus', children: getTemplates()}],
                            [{label: 'Delete All Fields', icon: 'lucide:trash', color: 'error', onSelect(e) { clearFields() }}]
                        ]"
                        size="sm"
                    >
                        <UButton icon="lucide:ellipsis" size="sm" variant="soft"/>
                    </UDropdownMenu>
                </div>
            </div>
            <ScrollAreaRoot class="rounded-xl border border-default" v-if="(descFields?.length || 0) > 0">
                <ScrollAreaViewport class="max-h-96 p-2">
                    <div class="grid grid-cols-2 gap-4">
                        <UCard
                            :ui="{
                        body: 'p-3 m-0 sm:p-3 h-fit',
                        header: 'p-2 sm:p-2'
                    }"
                            class="w-full"
                            v-for="(f, index) in descFields"
                            variant="subtle"
                            :key="index"
                        >
                            <template #header>
                                <div class="flex items-center gap-1.5">
                                    <div class="font-semibold px-2">{{f?.fieldName}}</div>
                                    <div class="flex-grow"/>
                                    <UButton size="sm" variant="ghost" icon="lucide:arrow-up" @click="moveFieldUp(index)"/>
                                    <UButton size="sm" variant="ghost" icon="lucide:arrow-down" @click="moveFieldDown(index)"/>
                                    <UButton size="sm" variant="ghost" color="error" icon="lucide:trash" @click="removeField(index)"/>
                                </div>
                            </template>
                            <template #default>
                                <template v-if="f != null">
                                    <UInput
                                        v-model="f.fieldValue as string"
                                        class="w-full"
                                        v-if="f.fieldType == 'input'"/>
                                    <UInputNumber
                                        v-model="f.fieldValue as number"
                                        class="w-full"
                                        v-else-if="f.fieldType == 'number'"/>
                                    <UInputMenu
                                        :items="f.fieldValue as string[]"
                                        multiple create-item
                                        @create="(tagstring: string) => {
                                            if (typeof(f.fieldValue) != typeof([] as string[]) || !f.fieldValue)
                                                f.fieldValue = [] as string[]
                                            (f.fieldValue as string[]).push(tagstring)
                                        }"
                                        v-model="f.fieldValue as string[]"
                                        class="w-full input-full justify-none"
                                        v-else-if="f.fieldType == 'tags'"/>
                                    <UTextarea
                                        v-model="f.fieldValue as string"
                                        class="w-full"
                                        v-else/>
                                </template>
                            </template>
                        </UCard>
                    </div>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar orientation="vertical" class="flex select-none touch-none p-0.5 z-20 bg-blackA1 transition-colors duration-[160ms] ease-out hover:bg-blackA2 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5">
                    <ScrollAreaThumb class="flex-1 bg-primary rounded-lg relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]"/>
                </ScrollAreaScrollbar>
            </ScrollAreaRoot>
        </template>
        <template #text="{ item }">
            <p class="text-muted text-xs mb-2">{{item.description}}</p>
            <UTextarea v-model="stateTextDesc" class="w-full"/>
        </template>
    </UTabs>
</template>

<style scoped>

</style>