import { FileText } from "lucide-react";

export default function ActionButtons() {
  return (
    <div className="flex flex-wrap items-center gap-2 lg:gap-3">
      {/* Download CV */}
      <a
        href="/Muhamad_Fathi_Farhat_CV.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 lg:gap-2 w-[132px] lg:w-[168px] px-3 py-2 lg:py-2.5 rounded-md border border-black/15 bg-[#e6e6e6] text-black text-[11px] lg:text-xs font-mono whitespace-nowrap cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-[#c9c9c9]">
        <FileText size={14} className="shrink-0" />
        Download CV
      </a>

      <a
        href="https://github.com/muhfathifarhat?tab=repositories"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 lg:gap-2 w-[132px] lg:w-[168px] px-3 py-2 lg:py-2.5 rounded-md border border-white/15 bg-[#0b0b0b] text-white text-[11px] lg:text-xs font-mono whitespace-nowrap cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-[#1b1b1b]">
        <FileText size={14} className="shrink-0" />
        Repository
      </a>
    </div>
  );
}
