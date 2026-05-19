import JSZip from "jszip";

export async function createZipFromBlobs(files: { fileName: string; blob: Blob }[]) {
  const zip = new JSZip();
  for (const file of files) zip.file(file.fileName, file.blob);
  return zip.generateAsync({ type: "blob" });
}
