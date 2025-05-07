<script setup lang="ts">
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import {ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport} from "reka-ui";
import {platform} from '@tauri-apps/plugin-os';
import {useWorkspaceSidebar} from "~/composables/workspace/useWorkspaceSidebar";

const $wk = useWorkspace()
const $sidebar = useWorkspaceSidebar()
</script>

<template>
    <div class="max-w-screen w-full left-0 right-0 top-0 h-fit flex items-center p-1.5 absolute z-10" data-tauri-drag-region v-if="unref($wk.loadedWorkspace)">
        <ScrollAreaRoot data-tauri-drag-region class="w-full max-w-screen">
            <ScrollAreaViewport data-tauri-drag-region class="w-full max-w-screen">
                <div data-tauri-drag-region class="flex items-center justify-center">
                    <UButton size="sm" :label="unref($wk.loadedWorkspace)?.name"/>
                </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="horizontal">
                <ScrollAreaThumb/>
            </ScrollAreaScrollbar>
        </ScrollAreaRoot>
    </div>
</template>

<style scoped>

</style>