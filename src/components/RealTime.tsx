import { useToolsFunctions } from "@/hooks/use-tools";
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import { tools } from "@/lib/tools";
import { useEffect, useState } from "react";
import { VoiceSelector } from "./ui/voice-select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { createLLMTools } from "vovk";
import { TaskRPC, UserRPC } from "vovk-client";
import Floaty from "./Floaty";

const { tools: llmTools } = createLLMTools({
        modules: { TaskRPC, UserRPC }
    });

const RealTime = () => {
  // State for voice selection
  const [voice, setVoice] = useState< "ash" | "ballad" | "coral" | "sage" | "verse">("ash");

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
      <VoiceSelector value={voice} onValueChange={setVoice} />
      <div className="flex flex-col items-center justify-center min-h-full gap-4">
      <button
        onClick={handleStartStopClick}
        className="px-4 py-2 rounded-lg text-sm shadow-md focus:outline-none border hover:bg-primary-dark transition-colors duration-200 ease-in-out"
      >
        Toggle Floaty
      </button>
      <p className="text-sm text-muted-foreground">Click to toggle floaty in bottom right corner of the screen.</p>
      {(
        <Floaty 
          isActive={isSessionActive} 
          volumeLevel={currentVolume} 
          handleClick={handleStartStopClick} 
        />
      )}
    </div>
      <Button
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
      </Button>
    </div>
  );
};

export default RealTime;
