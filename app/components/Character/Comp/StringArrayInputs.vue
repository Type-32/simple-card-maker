<script setup lang="ts">
import {ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport} from "reka-ui";
const stringArray = defineModel<string[]>()
const props = defineProps<{
    buttonText?: string,
}>()
</script>

<template>
    <UButton size="xs" :label="buttonText || 'Add Text'" variant="soft" class="w-full justify-center mb-3 mt-1" icon="lucide:plus" @click="() => {
        if (!stringArray) stringArray = [] as string[]
        stringArray.push('')
    }"/>
    <ScrollAreaRoot v-if="stringArray != undefined">
        <ScrollAreaViewport class="max-h-96 p-0.5">
            <div class="grid grid-cols-1 gap-3">
                <div class="relative" v-for="(egmes, index) in stringArray" :key="index">
                    <UTextarea v-model="stringArray[index]" class="w-full"/>
                    <div class="absolute top-2 right-2 w-fit h-fit">
                        <UButton size="sm" icon="lucide:trash" color="error" variant="ghost" @click="() => {
                            if(stringArray != undefined)
                                stringArray.splice(index, 1)
                        }"/>
                    </div>
                </div>
            </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical" class="flex select-none touch-none p-0.5 z-20 bg-blackA1 transition-colors duration-[160ms] ease-out hover:bg-blackA2 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5">
            <ScrollAreaThumb class="flex-1 bg-primary rounded-lg relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-2 before:min-h-2"/>
        </ScrollAreaScrollbar>
    </ScrollAreaRoot>
</template>

<style scoped>

</style>