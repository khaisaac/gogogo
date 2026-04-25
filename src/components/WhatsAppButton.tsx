"use client";

import styles from "./WhatsAppButton.module.css";

export default function WhatsAppButton() {
  return (
    <a
      href="https://api.whatsapp.com/send?phone=6287765550004&text=Hello%2C%20I%20want%20to%20book%20a%20Rinjani%20trekking%20package"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label="Chat on WhatsApp"
      id="whatsapp-button"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958a15.924 15.924 0 008.832 2.664C24.826 31.996 32 24.82 32 15.996 32 7.176 24.826 0 16.004 0zm9.534 22.606c-.398 1.12-2.336 2.142-3.222 2.212-.886.07-1.706.398-5.748-1.198-4.86-1.918-7.928-6.93-8.168-7.252-.24-.322-1.96-2.608-1.96-4.974 0-2.366 1.24-3.528 1.68-4.01.44-.48.96-.6 1.28-.6.32 0 .64.002.92.016.296.014.694-.112 1.086.828.398.952 1.356 3.318 1.476 3.558.12.24.2.52.04.84-.16.32-.24.52-.48.8-.24.28-.504.626-.72.84-.24.24-.49.498-.21.978.28.48 1.244 2.054 2.672 3.326 1.836 1.636 3.384 2.144 3.864 2.384.48.24.76.2 1.04-.12.28-.32 1.2-1.4 1.52-1.88.32-.48.64-.4 1.08-.24.44.16 2.8 1.32 3.28 1.56.48.24.8.36.92.56.12.2.12 1.152-.278 2.272z"/>
      </svg>
      <span className={styles.tooltip}>Chat with us!</span>
    </a>
  );
}
