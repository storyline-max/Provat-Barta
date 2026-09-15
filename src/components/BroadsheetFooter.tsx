import React from 'react';
import { ProvatBartaLogo } from './ProvatBartaLogo';
import { Award, ShieldCheck, Mail, MapPin, Phone, Printer, Bookmark } from 'lucide-react';

interface BroadsheetFooterProps {
  onOpenPartnerDashboard: () => void;
  onOpenSubmitTip: () => void;
  onPrintPaper: () => void;
  onOpenArchive: () => void;
  onOpenPuzzles?: () => void;
  onOpenSavedArticles?: () => void;
}

export const BroadsheetFooter: React.FC<BroadsheetFooterProps> = ({
  onOpenPartnerDashboard,
  onOpenSubmitTip,
  onPrintPaper,
  onOpenArchive,
  onOpenPuzzles,
  onOpenSavedArticles,
}) => {
  return (
    <footer className="border-t-4 border-[#00204A] bg-[#f4f1ea] text-stone-800 text-[12px] font-dateline pt-10 pb-8 mt-12 no-print">
      <div className="max-w-7xl mx-auto px-4">
        {/* Masthead Banner */}
        <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-stone-300">
          <ProvatBartaLogo variant="full" showTaglines={true} />
          <p className="max-w-2xl text-[13px] font-editorial text-stone-600 italic mt-3 text-center">
            "An independent international broadsheet published daily for the global Bengali diaspora and American readership, dedicated to truth, impartiality, and fearless investigative reporting."
          </p>
        </div>

        {/* 4 Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-b border-stone-300">
          {/* Col 1: Bureaus */}
          <div>
            <h5 className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#00204A] mb-3">
              Global News Bureaus
            </h5>
            <ul className="space-y-2 text-stone-600 text-[11px]">
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 text-[#E5000C] mt-0.5 flex-shrink-0" />
                <span><strong>New York Bureau:</strong> 42nd St & Broadway, Manhattan, NY 10036</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 text-[#E5000C] mt-0.5 flex-shrink-0" />
                <span><strong>Washington Bureau:</strong> National Press Building, Washington D.C.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 text-[#E5000C] mt-0.5 flex-shrink-0" />
                <span><strong>Dhaka Bureau:</strong> Kawran Bazar C/A, Dhaka 1215</span>
              </li>
            </ul>
          </div>

          {/* Col 2: Editorial Leadership */}
          <div>
            <h5 className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#00204A] mb-3">
              Editorial Directorate
            </h5>
            <ul className="space-y-1.5 text-stone-600 text-[11px]">
              <li><strong>Editor-in-Chief:</strong> Dr. K. M. Rahman</li>
              <li><strong>Executive Editor:</strong> Eleanor Vance-Sterling</li>
              <li><strong>Managing Editor:</strong> Farhan Chowdhury</li>
              <li><strong>Diaspora Affairs Editor:</strong> Sharmeen Akhtar</li>
              <li><strong>Standards & Ombudsman:</strong> Justice (Ret.) M. Haque</li>
            </ul>
          </div>

          {/* Col 3: Provat Partner Program */}
          <div>
            <h5 className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#00204A] mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#FD8B18]" />
              <span>Provat Partner (PPP)</span>
            </h5>
            <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
              Read news, share truth, and earn 50% ad revenue split daily. Instant mobile withdrawals via bKash, Nagad, and direct bank wire.
            </p>
            <button
              onClick={onOpenPartnerDashboard}
              className="font-bold text-[#00204A] hover:text-[#E5000C] underline decoration-1 text-[11px] uppercase tracking-wider"
            >
              Open PPP Dashboard →
            </button>
          </div>

          {/* Col 4: Reader Services & Tools */}
          <div>
            <h5 className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#00204A] mb-3">
              Reader Services
            </h5>
            <ul className="space-y-2 text-stone-600 text-[11px]">
              <li>
                <button
                  onClick={onOpenSubmitTip}
                  className="hover:text-[#E5000C] transition-colors text-left"
                >
                  Write a Letter to the Editor
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSubmitTip}
                  className="hover:text-[#E5000C] transition-colors text-left"
                >
                  Submit a Confidential Whistleblower Tip
                </button>
              </li>
              <li>
                <button
                  onClick={onPrintPaper}
                  className="hover:text-[#E5000C] transition-colors text-left flex items-center gap-1"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print Today's Broadsheet (A1–A8)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenArchive}
                  className="hover:text-[#E5000C] transition-colors text-left flex items-center gap-1"
                >
                  <span>Archival Microfilm Edition (2024–2026)</span>
                </button>
              </li>
              {onOpenSavedArticles && (
                <li>
                  <button
                    onClick={onOpenSavedArticles}
                    className="hover:text-[#E5000C] transition-colors text-left flex items-center gap-1 text-[#00204A] font-semibold"
                  >
                    <Bookmark className="w-3 h-3 text-[#E5000C]" />
                    <span>Read Later &amp; Bookmarked Dispatches</span>
                  </button>
                </li>
              )}
              {onOpenPuzzles && (
                <li>
                  <button
                    onClick={onOpenPuzzles}
                    className="hover:text-[#E5000C] transition-colors text-left font-semibold text-[#00204A] flex items-center gap-1"
                  >
                    <span>Daily Crossword &amp; Sudoku Lounge</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Colophon & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px] gap-2">
          <div>
            © 2026 The Provat Barta Media Group LLC. All Rights Reserved. Member, Associated Press & South Asian Journalists Association.
          </div>
          <div className="flex items-center gap-4">
            <span>ISSN 2831-904X</span>
            <span>•</span>
            <span>Verified Print & Digital Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
