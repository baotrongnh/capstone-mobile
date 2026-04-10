import axios from "axios"

type UploadResourceType = "image" | "video" | "raw"

const getResourceType = (fileName: string): UploadResourceType => {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? ""

    if (["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext)) {
        return "image"
    }

    if (["mp4", "mov", "avi", "mkv"].includes(ext)) {
        return "video"
    }

    return "raw"
}

const inferFileName = (uri: string) => {
    const chunks = uri.split("/")
    const lastChunk = chunks[chunks.length - 1]
    if (typeof lastChunk === "string" && lastChunk.length > 0) {
        return lastChunk
    }

    return `avatar-${Date.now()}.jpg`
}

const inferMimeType = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()

    if (ext === "png") return "image/png"
    if (ext === "webp") return "image/webp"
    if (ext === "gif") return "image/gif"
    if (ext === "heic") return "image/heic"

    return "image/jpeg"
}

export const uploadImageFromUri = async (uri: string) => {
    const fileName = inferFileName(uri)
    const mimeType = inferMimeType(fileName)
    const resourceType = getResourceType(fileName)

    const formData = new FormData()
    formData.append("file", {
        uri,
        name: fileName,
        type: mimeType,
    } as unknown as Blob)
    formData.append("upload_preset", "course")

    const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dcg8qoxmr/${resourceType}/upload`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    )

    return {
        url: res.data.secure_url as string,
        format: res.data.format as string,
        resourceType,
    }
}
