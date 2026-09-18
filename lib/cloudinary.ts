// Client-side upload straight to Cloudinary using an unsigned upload preset.
// No file ever passes through our server or gets stored in MongoDB — only
// the resulting secure_url does. Requires two PUBLIC env vars (safe to
// expose in the browser, unlike the Cloudinary API secret):
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
// A video preset is optional for backwards compatibility. It lets teams keep
// a restrictive image preset while configuring Cloudinary's video-specific
// allowed formats and file-size limits separately.
const VIDEO_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET || UPLOAD_PRESET;

export const CLOUDINARY_CONFIGURED = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!CLOUDINARY_CONFIGURED) {
    throw new Error(
      "Image upload isn't configured yet. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET!);
  formData.append("folder", "ra-homes");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Upload failed. Please try again.");
  }

  const data = await res.json();
  return data.secure_url as string;
}

// Videos use Cloudinary's separate video endpoint. The unsigned preset must
// permit video uploads; configure its allowed formats and maximum size in the
// Cloudinary console as a second line of defence.
export async function uploadVideoToCloudinary(file: File): Promise<string> {
  if (!CLOUDINARY_CONFIGURED) {
    throw new Error(
      "Video upload isn't configured yet. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", VIDEO_UPLOAD_PRESET!);
  formData.append("folder", "ra-homes/videos");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const cloudinaryMessage = err?.error?.message || res.headers.get("x-cld-error");
    throw new Error(
      cloudinaryMessage ||
        "Video upload failed. Check that the Cloudinary video preset is unsigned and allows this format."
    );
  }

  const data = await res.json();
  if (data.resource_type !== "video" || typeof data.secure_url !== "string") {
    throw new Error("Cloudinary did not return a playable video URL.");
  }
  return data.secure_url;
}
