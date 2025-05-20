import {useQuickToasts} from "~/composables/utility/useQuickToasts";
import {useWorkspace} from "~/composables/workspace/useWorkspace";
import type {WorkspaceBook} from "~/types/maker.types";
import type {PossiblyRef} from "~/types/utility.types";

export function useLorebook() {
    const $qt = useQuickToasts();
    const { loadedWorkspace, writeWorkspace, saveWorkspace, directToWorkspace } = useWorkspace();

    const $currentBookId = computed(() => useRoute().params.bookId as string);
    const $currentBook = computed({
        get(): WorkspaceBook | undefined {
            if (!loadedWorkspace.value) return undefined;
            return loadedWorkspace.value.books.find(book => book.id === $currentBookId.value);
        },
        set(newValue: Partial<WorkspaceBook>) {
            if (!newValue || !$currentBookId.value) return;
            writeBook($currentBookId.value, newValue);
        }
    });

    function writeBook(
        bookId: PossiblyRef<string>,
        data: Partial<WorkspaceBook>
    ) {
        const id = unref(bookId);
        const wks = unref(loadedWorkspace)
        if (!id || !wks) return;


        const bookIndex = wks.books.findIndex(b => b.id === id);

        if (bookIndex === -1) {
            $qt.error("Updating Book", `Book ${id} not found in current workspace`);
            return;
        }

        // Create updated book while preserving unspecified properties
        const updatedBook = {
            ...wks.books[bookIndex],
            ...data,
            id: id // Ensure ID remains the same
        };

        // Update the workspace with the modified book
        writeWorkspace({
            books: [
                ...wks.books.slice(0, bookIndex),
                updatedBook,
                ...wks.books.slice(bookIndex + 1)
            ] as WorkspaceBook[]
        })
    }

    function getBook(bookId: PossiblyRef<string>): WorkspaceBook | undefined {
        const id = unref(bookId);
        const wks = unref(loadedWorkspace)
        if (!wks) return undefined;
        return wks.books.find(book => book.id === id);
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
        currentBookId: $currentBookId,
        currentBook: $currentBook,
        writeBook,
        getBook,
        backToWorkspace
    };
}