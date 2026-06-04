import JSZip from "jszip";

export interface ZipEntry {
  filename: string;
  data: Uint8Array;
}

export async function buildZip(entries: ZipEntry[]): Promise<Uint8Array> {
  const zip = new JSZip();
  const usedNames = new Set<string>();
  for (const entry of entries) {
    let name = entry.filename;
    if (usedNames.has(name)) {
      const dot = name.lastIndexOf(".");
      const stem = dot > 0 ? name.slice(0, dot) : name;
      const ext = dot > 0 ? name.slice(dot) : "";
      let i = 2;
      while (usedNames.has(`${stem}-${i}${ext}`)) i++;
      name = `${stem}-${i}${ext}`;
    }
    usedNames.add(name);
    zip.file(name, entry.data);
  }
  return await zip.generateAsync({ type: "uint8array" });
}
