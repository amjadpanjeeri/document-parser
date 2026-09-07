const THUMBNAIL_MAX_SIZE = 512
const THUMBNAIL_QUALITY = 0.8

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Couldn't decode image"))
    image.src = src
  })
}

/**
 * Generate a small thumbnail (data URL) for an image file, downscaled so
 * cards stay lightweight. Returns null for non-images or when decoding fails.
 */
async function generateImageThumbnail(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    const scale = Math.min(
      1,
      THUMBNAIL_MAX_SIZE / Math.max(image.width, image.height)
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))

    const context = canvas.getContext("2d")
    if (!context) return null

    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    let dataUrl = canvas.toDataURL("image/webp", THUMBNAIL_QUALITY)
    if (!dataUrl.startsWith("data:image/webp")) {
      dataUrl = canvas.toDataURL("image/jpeg", THUMBNAIL_QUALITY)
    }
    return dataUrl
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export { generateImageThumbnail }
