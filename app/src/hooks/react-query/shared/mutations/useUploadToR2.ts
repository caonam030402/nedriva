/**
 * Shared React Query mutation hook for uploading files directly to R2.
 *
 * Usage:
 *   const upload = useUploadToR2();
 *   const { mutate } = upload;
 *
 *   mutate(
 *     { file, folder: 'bg-removal' },
 *     {
 *       onSuccess: ({ fileKey, url }) => { /* do something *\/ },
 *       onError: (err) => { /* handle error *\/ },
 *     }
 *   );
 *
 * Returns { fileKey, url } on success.
 */
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { uploadFileToR2 } from '@/libs/r2';

export type UploadToR2Variables = {
  /** Browser `File` object to upload */
  file: File;
  /**
   * Folder path under `inputs/{userId}/`.
   * Examples: "bg-removal", "enhancer", "videos"
   */
  folder: string;
};

export type UploadToR2Result = {
  /** R2 object key, e.g. `inputs/{userId}/bg-removal/photo.png` */
  fileKey: string;
  /** Full public URL, e.g. `https://pub-xxx.r2.dev/inputs/...` */
  url: string;
};

/**
 * Mutation hook: uploads a file to R2 via presigned URL.
 * Throws with a descriptive Error on failure.
 * @param options
 */
export function useUploadToR2(
  options?: UseMutationOptions<UploadToR2Result, Error, UploadToR2Variables>,
) {
  return useMutation({
    mutationFn: ({ file, folder }: UploadToR2Variables) =>
      uploadFileToR2(file, folder),
    ...options,
  });
}
