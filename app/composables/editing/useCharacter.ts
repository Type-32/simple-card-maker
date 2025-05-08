import type {WorkspaceCard} from "~/types/maker.types";
import type {PossiblyRef} from "~/types/utility.types";
import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import {useWorkspace} from "~/composables/workspace/useWorkspace";

export function useCharacter() {
    const $qt = useQuickToasts();
    const { loadedWorkspace, writeWorkspace, saveWorkspace, directToWorkspace } = useWorkspace();

    const $currentCharacterId = computed(() => useRoute().params.characterId as string);
    const $currentCharacter = computed({
        get(): WorkspaceCard | undefined {
            if (!loadedWorkspace.value) return undefined;
            return loadedWorkspace.value.cards.find((card: WorkspaceCard) => card.id === $currentCharacterId.value);
        },
        set(newValue: Partial<WorkspaceCard>) {
            if (!newValue || !$currentCharacterId.value) return;
            writeCharacterCard($currentCharacterId.value, newValue);
        }
    });

    function writeCharacterCard(
        characterId: PossiblyRef<string>,
        data: Partial<WorkspaceCard>
    ) {
        const id = unref(characterId);
        const wks = unref(loadedWorkspace)
        if (!id || !wks) return;

        const cardIndex = wks.cards.findIndex(c => c.id === id);

        if (cardIndex === -1) {
            $qt.error("Updating Character", `Character ${id} not found in current workspace`);
            return;
        }

        // Create updated card while preserving unspecified properties
        const updatedCard = {
            ...wks.cards[cardIndex],
            ...data,
            id: id // Ensure ID remains the same
        };

        // Update the workspace with the modified card
        writeWorkspace({
            cards: [
                ...wks.cards.slice(0, cardIndex),
                updatedCard,
                ...wks.cards.slice(cardIndex + 1)
            ] as WorkspaceCard[]
        })
    }

    function getCharacterCard(characterId: PossiblyRef<string>): WorkspaceCard | undefined {
        const id = unref(characterId);
        const wks = unref(loadedWorkspace)
        if (!wks) return undefined;
        return wks.cards.find(card => card.id === id);
    }

    function backToWorkspace() {
        const wks = unref(loadedWorkspace)
        if (!wks) {
            $qt.error("Error Returning to Workspace", "Your workspace had managed to somehow... disappear. Please restart the application to make sure that no further changes are lost.")
            return
        }
        saveWorkspace().then(r => {
            $qt.info("Auto Save", "Saved Workspace Automatically.")
        })
        directToWorkspace(wks.id)
    }

    return {
        currentCharacterId: readonly($currentCharacterId),
        currentCharacter: $currentCharacter,
        writeCharacterCard,
        getCharacterCard,
        backToWorkspace
    };
}