"use client";
// Creds: https://github.com/cameronking4/openai-realtime-api-nextjs
import confetti from "canvas-confetti";
import { animate as framerAnimate } from "framer-motion";
import FirecrawlApp, { ScrapeResponse } from "@mendable/firecrawl-js";

export const useToolsFunctions = () => {
  const timeFunction = () => {
    const now = new Date();
    return {
      success: true,
      time: now.toLocaleTimeString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      message:
        "Announce to user: The current time is  " +
        now.toLocaleTimeString() +
        " in " +
        Intl.DateTimeFormat().resolvedOptions().timeZone +
        " timezone.",
    };
  };

  const partyFunction = () => {
    try {
      const duration = 5 * 1000;
      const colors = [
        "#a786ff",
        "#fd8bbc",
        "#eca184",
        "#f8deb1",
        "#3b82f6",
        "#14b8a6",
        "#f97316",
        "#10b981",
        "#facc15",
      ];

      const confettiConfig = {
        particleCount: 30,
        spread: 100,
        startVelocity: 90,
        colors,
        gravity: 0.5,
      };

      const shootConfetti = (
        angle: number,
        origin: { x: number; y: number },
      ) => {
        confetti({
          ...confettiConfig,
          angle,
          origin,
        });
      };

      const animate = () => {
        const now = Date.now();
        const end = now + duration;

        const elements = document.querySelectorAll(
          "div, p, button, h1, h2, h3",
        );
        elements.forEach((element) => {
          framerAnimate(
            element,
            {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            },
            {
              duration: 0.5,
              repeat: 10,
              ease: "easeInOut",
            },
          );
        });

        const frame = () => {
          if (Date.now() > end) return;
          shootConfetti(60, { x: 0, y: 0.5 });
          shootConfetti(120, { x: 1, y: 0.5 });
          requestAnimationFrame(frame);
        };

        const mainElement = document.querySelector("main");
        if (mainElement) {
          mainElement.classList.remove(
            "bg-gradient-to-b",
            "from-gray-50",
            "to-white",
          );
          const originalBg = mainElement.style.backgroundColor;

          const changeColor = () => {
            const now = Date.now();
            const end = now + duration;

            const colorCycle = () => {
              if (Date.now() > end) {
                framerAnimate(
                  mainElement,
                  { backgroundColor: originalBg },
                  { duration: 0.5 },
                );
                return;
              }
              const newColor =
                colors[Math.floor(Math.random() * colors.length)];
              framerAnimate(
                mainElement,
                { backgroundColor: newColor },
                { duration: 0.2 },
              );
              setTimeout(colorCycle, 200);
            };

            colorCycle();
          };

          changeColor();
        }

        frame();
      };

      animate();
      return { success: true, message: "Party mode activated 🎉" };
    } catch (error) {
      return {
        success: false,
        message: "Failed to activate party mode: " + error,
      };
    }
  };

  const scrapeWebsite = async ({ url }: { url: string }) => {
    const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY;
    try {
      const app = new FirecrawlApp({ apiKey: apiKey });
      const scrapeResult = (await app.scrapeUrl(url, {
        formats: ["markdown", "html"],
      })) as ScrapeResponse;

      if (!scrapeResult.success) {
        console.log(scrapeResult.error);
        return {
          success: false,
          message: `Failed to scrape: ${scrapeResult.error}`,
        };
      }

      console.log("xxxx scrapeResult", scrapeResult);

      return {
        success: true,
        message:
          "Here is the scraped website content: " +
          JSON.stringify(scrapeResult.markdown) +
          "Summarize and explain it to the user now in a response.",
      };
    } catch (error) {
      return {
        success: false,
        message: `Error scraping website: ${error}`,
      };
    }
  };

  return {
    timeFunction,
    partyFunction,
    scrapeWebsite,
  };
};
