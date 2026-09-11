export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  maxSizeBytes?: number; // default: 10MB
}

const DEFAULT_CLOUD_NAME = "jo6luymo";
const DEFAULT_UPLOAD_PRESET = "negm_store_products";
const DEFAULT_FOLDER = "negm-store/products";

/**
 * Direct browser upload to Cloudinary using an unsigned upload preset.
 * No Cloudinary API Secret is ever required or exposed.
 */
export function uploadToCloudinary(
  file: File,
  options?: UploadOptions
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME;
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || DEFAULT_UPLOAD_PRESET;
    const folder =
      process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || DEFAULT_FOLDER;

    const maxSizeBytes = options?.maxSizeBytes || 10 * 1024 * 1024; // 10 MB

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/avif",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return reject(
        new Error(
          "Invalid file type. Please upload a valid image (JPEG, PNG, WebP, AVIF, or SVG)."
        )
      );
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      return reject(
        new Error(`File is too large. Maximum allowed size is ${maxMb}MB.`)
      );
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);

    // Track upload progress
    if (options?.onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (err) {
          reject(new Error("Failed to parse Cloudinary response."));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          const errorMsg =
            errorResponse?.error?.message ||
            `Upload failed with status code ${xhr.status}`;
          reject(new Error(errorMsg));
        } catch {
          reject(new Error(`Upload failed with status code ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during Cloudinary image upload."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Cloudinary image upload request timed out."));
    };

    xhr.send(formData);
  });
}
