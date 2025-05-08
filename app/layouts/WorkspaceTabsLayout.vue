<script setup lang="ts">
import {
    ScrollAreaRoot,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport, SplitterGroup,
    SplitterPanel,
    SplitterResizeHandle
} from "reka-ui";
import {useWorkspaceSidebar} from "~/composables/workspace/useWorkspaceSidebar";

const sidebarRef = ref()
const $sidebar = useWorkspaceSidebar()
</script>

<template>
    <div>
        <div class="h-screen max-h-screen">
            <WorkspaceTabsBar/>
            <SplitterGroup
                auto-save-id="scm.ui.group1.root.autosave"
                class="h-full"
                id="scm.ui.group1.root"
                direction="horizontal"
            >
                <SplitterPanel
                    id="scm.ui.group1.panel.right-sidebar"
                    :class="['max-h-screen h-full bottom-0 top-0 bg-default']"
                    :min-size="10"
                    :max-size="30"
                    collapsible
                    :collapsed-size="0"
                    :default-size="0"
                    :on-collapse="() => { $sidebar.setSidebar('left', true) }"
                    :on-expand="() => { $sidebar.setSidebar('left', false) }"
                    ref="sidebarRef"
                >
                    <div class="flex flex-col gap-2 justify-start items-start top-0 bottom-0 relative right-0 left-0 h-full">
                        <div class="w-full flex flex-col items-start" data-tauri-drag-region>
                            <div class="h-10"/>
                        </div>
                        <ScrollAreaRoot class="px-2 w-full flex-grow select-none">
                            <ScrollAreaViewport class="w-full">
                            </ScrollAreaViewport>
                            <ScrollAreaScrollbar orientation="vertical">
                                <ScrollAreaThumb />
                            </ScrollAreaScrollbar>
                        </ScrollAreaRoot>
                    </div>
                </SplitterPanel>
                <SplitterResizeHandle id="scm.ui.group1.handle.1" class="rounded-lg border-[0.5px] border-default"/>
                <SplitterPanel id="scm.ui.group1.panel.contentSection" class="top-0 bottom-0 relative overflow-visible bg-default">
                    <div class="h-full w-full overflow-visible">
                        <ScrollAreaRoot class="relative h-full w-full overflow-visible">
                            <ScrollAreaViewport class="w-full h-full rounded-lg bg-default overflow-visible">
                                <slot/>
                            </ScrollAreaViewport>
                            <ScrollAreaScrollbar>
                                <ScrollAreaThumb />
                            </ScrollAreaScrollbar>
                        </ScrollAreaRoot>
                    </div>
                </SplitterPanel>
                <SplitterResizeHandle id="scm.ui.group1.handle.2" class="rounded-lg border-[0.5px] border-default"/>
                <SplitterPanel
                    id="scm.ui.group1.panel.left-sidebar"
                    :class="['max-h-screen h-full bottom-0 top-0 bg-default']"
                    :min-size="10"
                    :max-size="30"
                    collapsible
                    :collapsed-size="0"
                    :default-size="0"
                    :on-collapse="() => { $sidebar.setSidebar('right', true) }"
                    :on-expand="() => { $sidebar.setSidebar('right', false) }"
                    ref="sidebarRef"
                >
                    <div class="flex flex-col gap-2 justify-start items-start top-0 bottom-0 relative right-0 left-0 h-full">
                        <div class="w-full flex flex-col items-start" data-tauri-drag-region>
                            <div class="h-10"/>
                        </div>
                        <ScrollAreaRoot class="px-2 w-full flex-grow select-none">
                            <ScrollAreaViewport class="w-full">
                            </ScrollAreaViewport>
                            <ScrollAreaScrollbar>
                                <ScrollAreaThumb/>
                            </ScrollAreaScrollbar>
                        </ScrollAreaRoot>
                    </div>
                </SplitterPanel>
            </SplitterGroup>
        </div>
    </div>
</template>

<style scoped>

</style>