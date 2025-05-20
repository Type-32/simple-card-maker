export function useCustomImageProvider() {
    return {
        getImage(src: string, modifiers: any) {
            // Return the URL directly without processing
            return src;
        }
    }
}