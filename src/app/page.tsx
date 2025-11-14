"use client";

import Api from "./api/api";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// React-PDF for client
const PDFViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
});

import { FaRegTrashCan } from "react-icons/fa6";
import { VscJson } from "react-icons/vsc";
import { ReactTyped } from "react-typed";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Experience {
  company?: string;
  title?: string;
  startYear?: string;
  endYear?: string;
  location?: string;
  description?: string;
}

interface Education {
  university?: string;
  degree?: string;
  gpa?: string;
  startYear?: string;
  endYear?: string;
}

export default function Home() {
  const { output, setOutput, handleOpenAI, loading } = Api();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("summarize");

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);

     // Generate preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPdfPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // api/parse-pdf
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        alert("Gagal membaca PDF: " + data.error);
        return;
      }

      // get text from response
      const extractedText =
        data.text ||
        data.result ||
        data.raw_output ||
        JSON.stringify(data, null, 2);


      if (!extractedText) {
        alert("PDF berhasil diunggah, tapi teks tidak ditemukan.");
        return;
      }

      console.log("📄 Extracted Text (preview):", extractedText.slice(0, 200));

      // send text hasil parsing ke AI
      handleOpenAI(extractedText);
    } catch (err: any) {
      console.error("❌ Error uploading or parsing PDF:", err);
      alert("Terjadi kesalahan saat membaca PDF.");
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfPreview(null);
    setOutput(null);
    const fileInput = document.getElementById("pdfInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };
  const [scale, setScale] = useState(0.4); // Default scale for desktop

  useEffect(() => {
    // Update scale based on window size
    const handleResize = () => {
      if (window.innerWidth < 768) setScale(1); // Full scale for mobile
      else setScale(0.4); // Smaller scale for desktop
    };
    handleResize(); // Initial check for scale on load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Cleanup on unmount
  }, []);

  const handleTab = () => setTab(tab === "summarize" ? "raw" : "summarize");

  return (
    <div className="h-dvh">
      <nav className="flex items-center justify-between w-full py-10 px-4 sm:px-12 md:px-36">
        <div className="text-gray-700 dark:text-gray-200 font-semibold">
          PDF Summarizer
        </div>
        <div className="text-gray-700 dark:text-gray-200 font-semibold">
          Resume DemoAI
        </div>
      </nav>

      <main
        className={`${
          output ? "h-fit" : "h-full"
        } pb-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start px-4 sm:px-12 md:px-36`}
      >
        {/* === Upload & Preview Section === */}
        <div
          className={`h-full flex flex-col items-center ${
            output ? "justify-start" : "justify-center"
          } space-y-4`}
        >
          {!pdfPreview && (
            <div>
              <label
                htmlFor="pdfInput"
                className="cursor-pointer flex items-center justify-center border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-100 shadow-md"
              >
                <span className="text-gray-700 font-semibold">Upload PDF</span>
              </label>
              <input
                id="pdfInput"
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
            </div>
          )}

          {pdfPreview && <PDFViewer pdfPreview={pdfPreview} />}

          {pdfFile && (
            <div className="flex items-center gap-4">
              <div className="font-semibold text-sm md:text-base">
                {pdfFile.name}
              </div>
              <button onClick={handleRemovePdf}>
                <FaRegTrashCan className="text-sm md:text-base" />
              </button>
            </div>
          )}
        </div>

        {/* === Output / AI Summarized Section === */}
        <div
          className={`${
            output ? "h-fit" : "h-full"
          } w-full bg-white dark:bg-zinc-800 rounded-lg p-6 flex flex-col `}
        >
          {output && (
            <div className="flex justify-end items-center">
              <button onClick={handleTab}>
                <VscJson className="text-sm md:text-base" />
              </button>
            </div>
          )}

          {tab === "summarize" ? (
        loading ? (
          <Skeleton height={20} width={200} count={5} />
        ) : (
          <div className="space-y-4 text-gray-700 dark:text-gray-200">
            <h2 className="text-xl font-bold">
              {output?.personal_information?.name || "—"}
            </h2>
            <p className="font-medium">
              {output?.personal_information?.title || "No title"}
            </p>
            <p>{output?.personal_information?.city || "No city"}</p>

            <div>
              <h3 className="font-semibold text-lg mt-4 mb-2">Contact</h3>
              <ul className="text-sm space-y-1">
                <li>📧 {output?.contact?.email || "—"}</li>
                <li>🔗 {output?.contact?.linkedin || "—"}</li>
                <li>📞 {output?.contact?.phone || "—"}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mt-4 mb-2">Skills</h3>
              <p>{output?.additional_information?.technical_skills || "—"}</p>
            </div>
          </div>
        )
      ) : (
  <pre className="text-xs text-gray-500 dark:text-gray-400 overflow-x-auto">
    {JSON.stringify(output, null, 2)}
  </pre>
)}

        </div>
      </main>
    </div>
  );
}
