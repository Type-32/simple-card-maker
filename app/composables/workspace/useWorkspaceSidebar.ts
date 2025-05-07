import {useUUID} from "~/composables/utility/useUUID";

export function useWorkspaceSidebar() {
    // State for both sidebars
    const leftCollapsed = useState<boolean>(() => false)
    const rightCollapsed = useState<boolean>(() => true)

    // Event bus for sidebars changes
    const emitter = useEventBus<{sidebar: 'left' | 'right', collapsed: boolean}>('sidebars')

    // Toggle specific sidebar
    const toggleSidebar = (sidebar: 'left' | 'right') => {
        if (sidebar === 'left') {
            leftCollapsed.value = !unref(leftCollapsed)
        } else {
            rightCollapsed.value = !unref(rightCollapsed)
        }
        emitter.emit({ sidebar, collapsed: sidebar === 'left' ? unref(leftCollapsed) : unref(rightCollapsed) })
    }

    // Set specific sidebar state
    const setSidebar = (sidebar: 'left' | 'right', collapsed: boolean) => {
        if (sidebar === 'left') {
            leftCollapsed.value = collapsed
        } else {
            rightCollapsed.value = collapsed
        }
        emitter.emit({ sidebar, collapsed })
    }

    return {
        leftCollapsed: readonly(leftCollapsed),
        rightCollapsed: readonly(rightCollapsed),
        toggleSidebar,
        setSidebar,
        onSidebarChange: emitter.on
    }
}