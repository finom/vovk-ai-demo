import { useToolsFunctions } from "@/hooks/use-tools";
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import { tools } from "@/lib/tools";
import { useEffect, useState } from "react";
import { createLLMTools } from "vovk";
import { TaskRPC, UserRPC } from "vovk-client";
import Floaty from "./Floaty";

const { tools: llmTools } = createLLMTools({
  modules: { TaskRPC, UserRPC },
});

const RealTime = () => {
  // State for voice selection
  const [voice] = useState<"ash" | "ballad" | "coral" | "sage" | "verse">(
    "ash",
  );

  // WebRTC Audio Session Hook
  const {
    // status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    // msgs,
    // conversation,
    // sendTextMessage,
    currentVolume,
  } = useWebRTCAudioSession(voice, [...tools, ...llmTools]);

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        timeFunction: "getCurrentTime",
        partyFunction: "partyMode",
        scrapeWebsite: "scrapeWebsite",
      };

      registerFunction(functionNames[name], func);
    });

    // Register all LLM tools functions
    llmTools.forEach(({ name, execute }) => {
      registerFunction(name, execute);
    });
  }, [registerFunction, toolsFunctions]);

  return (
    <div>
      {/* <VoiceSelector value={voice} onValueChange={setVoice} /> */}
      <Floaty
        isActive={isSessionActive}
        volumeLevel={currentVolume}
        handleClick={handleStartStopClick}
      />
      {/* <Button
        variant={isSessionActive ? "destructive" : "default"}
        className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2 motion-preset-shake"
        onClick={handleStartStopClick}
      >
        {isSessionActive && (
          <Badge
            variant="secondary"
            className="animate-pulse bg-red-100 text-red-700"
          >
            Live
          </Badge>
        )}
        {isSessionActive ? "End Broadcast" : "Start Broadcast"}
      </Button> */}
    </div>
  );
};

export default RealTime;
