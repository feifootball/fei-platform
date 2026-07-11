"use client";

import { useEffect, useState } from "react";

type CookieChoice = "accepted" | "rejected";

const STORAGE_KEY = "fei_cookie_consent_v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const savedChoice = localStorage.getItem(STORAGE_KEY);

    if (!savedChoice) {
      setVisible(true);
    }
  }, []);

  function saveChoice(choice: CookieChoice) {
    localStorage.setItem(STORAGE_KEY, choice);

    window.dispatchEvent(
      new CustomEvent("fei_cookie_consent_change", {
        detail: choice,
      }),
    );

    setVisible(false);
    setSettingsOpen(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] ml-auto max-w-[620px] sm:bottom-5 sm:right-5 sm:left-auto sm:w-[calc(100%-2.5rem)]">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-fei-bg/10 bg-white p-5 shadow-[0_24px_70px_rgba(7,17,31,0.18)] sm:p-6">
        <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent" />

        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Close cookie notice"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-fei-bg/10 text-fei-bg/45 transition hover:border-fei-bg/20 hover:bg-fei-bg/[0.04] hover:text-fei-bg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="m7 7 10 10" />
            <path d="M17 7 7 17" />
          </svg>
        </button>

        <div className="pr-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-fei-bg/45">
            Privacy
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-fei-bg">
            This website uses cookies
          </h2>

          <p className="mt-3 text-sm leading-6 text-fei-bg/60">
            We use essential cookies to keep FEI secure and working properly.
            Optional cookies may help us understand how the platform is used.
          </p>
        </div>

        {settingsOpen && (
          <div className="mt-5 rounded-[1.15rem] border border-fei-bg/10 bg-[#F7F8FA] p-4">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-bold text-fei-bg">
                  Essential cookies
                </p>
                <p className="mt-1 text-xs leading-5 text-fei-bg/52">
                  Required for login, security and core platform functions.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-fei-bg px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                Always active
              </span>
            </div>

            <div className="mt-4 border-t border-fei-bg/[0.08] pt-4">
              <p className="text-sm font-bold text-fei-bg">
                Optional cookies
              </p>
              <p className="mt-1 text-xs leading-5 text-fei-bg/52">
                Analytics and other optional technologies remain disabled
                unless you accept them.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-fei-bg/58 transition hover:bg-fei-bg/[0.04] hover:text-fei-bg"
          >
            {settingsOpen ? "Hide settings" : "Cookie settings"}
          </button>

          <button
            type="button"
            onClick={() => saveChoice("rejected")}
            className="rounded-full border border-fei-bg/15 px-5 py-2.5 text-sm font-semibold text-fei-bg transition hover:border-fei-bg/30 hover:bg-fei-bg/[0.035]"
          >
            Reject all
          </button>

          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="rounded-full bg-fei-yellow px-5 py-2.5 text-sm font-bold text-fei-bg transition hover:-translate-y-0.5 hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/20"
          >
            Accept all cookies
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-fei-bg/42">
          Learn more in our{" "}
          <a
            href="/privacy"
            className="font-semibold text-fei-bg underline decoration-fei-bg/25 underline-offset-4 transition hover:decoration-fei-bg"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
