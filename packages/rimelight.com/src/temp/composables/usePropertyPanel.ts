import { computed, type Ref } from "vue";
import type { PageData } from "@/types/Page";

/**
 * Options for the usePropertyPanel composable.
 */
interface UsePropertyPanelOptions {
    /**
     * A reactive reference to the PageData object that this panel will manage.
     * The composable will read from and update this ref.
     */
    pageData: Ref<PageData>;
}

/**
 * Composable to provide logic and handlers for a page property panel.
 * It manages changes to the page title and general page properties.
 *
 * @param options - An object containing a reactive reference to the PageData.
 * @returns An object containing reactive page title and properties,
 * along with handler functions to update them.
 */
export const usePropertyPanel = ({
                                     pageData,
                                 }: UsePropertyPanelOptions) => {
    // Derive pageTitle reactively from pageData
    const pageTitle = computed(() => pageData.value?.title || '');

    // Derive pageProperties reactively from pageData
    const pageProperties = computed(() => pageData.value?.properties || {});

    /**
     * Handles changes to the page title.
     * Directly updates the `title` property of the `pageData` ref.
     * @param newTitleString - The new title string.
     */
    const handlePageTitleChange = (newTitleString: string) => {
        if (!pageData.value) {
            // Handle the case where pageData.value is not yet set
            console.warn("pageData.value is not initialized when attempting to change title.");
            return;
        }
        pageData.value = {
            ...pageData.value,
            title: newTitleString,
        };
    };

    /**
     * Handles changes to the page's custom properties.
     * Directly updates the `properties` object of the `pageData` ref.
     * @param updatedProperties - The new record of properties.
     */
    const handlePagePropertiesChange = (
        updatedProperties: Record<string, unknown>,
    ) => {
        if (!pageData.value) {
            // Handle the case where pageData.value is not yet set
            console.warn("pageData.value is not initialized when attempting to change properties.");
            return;
        }
        pageData.value = {
            ...pageData.value,
            properties: updatedProperties,
        };
    };

    return {
        pageTitle,
        pageProperties,
        handlePageTitleChange,
        handlePagePropertiesChange,
    };
};