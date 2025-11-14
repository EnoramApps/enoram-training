"use client";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useEffect, useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.js`;

interface Props {
  pdfPreview: string;
}

export default function PDFViewer({ pdfPreview }: Props) {
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const handleResize = () => {
      setScale(window.innerWidth < 768 ? 1 : 0.4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full sm:w-11/12 lg:w-full h-[400px] md:h-[700px] no-scrollbar overflow-y-auto border rounded-lg shadow-md">
      <Document file={pdfPreview}>
        <Page pageNumber={1} scale={scale} loading="Loading PDF..." />
      </Document>
    </div>
  );
}
