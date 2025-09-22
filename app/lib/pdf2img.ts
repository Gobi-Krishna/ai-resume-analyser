// pdf2img.ts

export interface PdfConversionResult {
  pageNumber: number;
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult[]> {
  try {
    const lib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

    const results: PdfConversionResult[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        results.push({
          pageNumber: pageNum,
          imageUrl: "",
          file,
          error: "Canvas 2D context not available",
        });
        continue;
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      await page.render({ canvasContext: context, viewport }).promise;

      const imageUrl = canvas.toDataURL("image/png");

      results.push({
        pageNumber: pageNum,
        imageUrl,
        file,
      });
    }

    return results;
  } catch (err) {
    return [
      {
        pageNumber: 0,
        imageUrl: "",
        file,
        error: `Failed to convert PDF: ${err}`,
      },
    ];
  }
}
