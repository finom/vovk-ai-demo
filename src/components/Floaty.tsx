import { PhoneCallIcon, MicIcon, AudioLines, MoveUpRight } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

const Floaty = ({
  isActive,
  volumeLevel,
  handleClick,
}: {
  isActive: boolean;
  volumeLevel: number;
  handleClick: () => void;
}) => {
  const getIcon = () => {
    if (!isActive) {
      return <PhoneCallIcon className="text-secondary" />;
    } else if (isActive && volumeLevel > 0) {
      return <AudioLines className="text-secondary" />;
    } else {
      return <MicIcon className="text-secondary" />;
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50">
      <div>
        <MoveUpRight className="absolute text-red-600 scale-150 -left-6 top-14" />
        <div className="absolute text-red-600 -left-20 top-20 rotate-45 text-lg text-semibold">
          Voice Here
        </div>
      </div>
      <div className="relative flex items-center justify-center w-16 h-16">
        {isActive && volumeLevel > 0 && (
          <>
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-foreground z-0"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-foreground z-0"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-foreground z-0"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
            />
          </>
        )}
        <div
          className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl cursor-pointer z-10 bg-foreground"
          onClick={handleClick}
        >
          {getIcon()}
        </div>
      </div>
    </div>
  );
};
/*
const FloatyExample = () => {
  const [showCircle, setShowCircle] = useState(false);
  const { currentVolume, isSessionActive, handleStartStopClick } = useWebRTCAudioSession('ash');
 
  const handleButtonClick = () => {
    setShowCircle(!showCircle);
  };
 
  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-4">
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 rounded-lg text-sm shadow-md focus:outline-none border hover:bg-primary-dark transition-colors duration-200 ease-in-out"
      >
        Toggle Floaty
      </button>
      <p className="text-sm text-muted-foreground">Click to toggle floaty in bottom right corner of the screen.</p>
      {showCircle && (
        <FloatingCircle 
          isActive={isSessionActive} 
          volumeLevel={currentVolume} 
          handleClick={handleStartStopClick} 
        />
      )}
    </div>
  );
}
 */
export default Floaty;
