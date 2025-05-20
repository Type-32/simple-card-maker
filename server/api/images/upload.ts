import {useServerUUID} from "~~/server/utils/useServerUUID";

export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event)

    if(!formData || formData.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "No files uploaded",
        });
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif"
    ]

    const imageFile = formData[0];
    const storage = useStorage("uploads")

    const fileUUID = useServerUUID()
    await storage.setItemRaw(fileUUID, imageFile.data)
})