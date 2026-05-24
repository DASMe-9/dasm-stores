"use client";

import type { ButtonHTMLAttributes } from "react";

type TalkWindow = Window & {
  DASM_TALK?: Record<string, unknown>;
  DASMTalk?: { open?: () => void };
  dasmTalk?: { open?: () => void };
};

function openDasmTalk() {
  const talkWindow = window as TalkWindow;

  talkWindow.DASM_TALK = {
    ...(talkWindow.DASM_TALK ?? {}),
    entity_type: "support",
    entity_id: "stores-home",
    mode: "text+voice",
    role: "participant",
  };

  window.dispatchEvent(new CustomEvent("dasm-talk:update"));
  window.dispatchEvent(new CustomEvent("dasm-talk:open"));
  talkWindow.DASMTalk?.open?.();
  talkWindow.dasmTalk?.open?.();

  clickTalkLauncher();
  window.setTimeout(clickTalkLauncher, 350);
}

function clickTalkLauncher() {
  const selectors = [
    "[data-dasm-talk-open]",
    "[data-dasm-talk-launcher]",
    ".dasm-talk-launcher",
    "#dasm-talk-launcher",
    "[aria-label='DASM Talk']",
    "[title='DASM Talk']",
  ];

  for (const selector of selectors) {
    const launcher = document.querySelector<HTMLElement>(selector);
    if (launcher) {
      launcher.click();
      break;
    }
  }
}

export function TalkOpenButton({
  children = "تواصل معنا",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" onClick={openDasmTalk} className={className} {...props}>
      {children}
    </button>
  );
}
