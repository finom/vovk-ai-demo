"use client";
import { useToolsFunctions } from "@/hooks/use-tools";
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import { tools } from "@/lib/tools";
import { useEffect, useState } from "react";
import { createLLMTools } from "vovk";
import { TaskRPC, UserRPC } from "vovk-client";
import Floaty from "./Floaty";

const { tools: rpcTools } = createLLMTools({
  modules: { TaskRPC, UserRPC },
});

const RealTimeDemo = () => {
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
    currentVolume,
  } = useWebRTCAudioSession(voice, [...tools, ...rpcTools]);

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

    // Register all LLM RPC tool functions
    rpcTools.forEach(({ name, execute }) => {
      registerFunction(name, execute);
    });
  }, [registerFunction, toolsFunctions]);

  return (
    <div>
      <Floaty
        isActive={isSessionActive}
        volumeLevel={currentVolume}
        handleClick={handleStartStopClick}
      />
    </div>
  );
};

export default RealTimeDemo;
