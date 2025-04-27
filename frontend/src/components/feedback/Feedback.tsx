import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

export default function ResponseComponent() {
  const [submitted, setSubmitted] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = () => {
    setSubmitted(true);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 1000); // Total time for message to show before disappearing
  };

  return (
    <div className="flex h-full w-full items-end justify-center">
      <AnimatePresence>
        {!submitted && (
          <motion.div
            className="flex w-full space-x-2.5"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              size="sm"
              onClick={handleClick}
              className="cursor-pointer bg-black text-red-600 hover:bg-zinc-800/50 flex-1 border border-gray-800"
            >
              This should be an error
            </Button>
            <Button
              size="sm"
              onClick={handleClick}
              className="cursor-pointer bg-black text-green-600 hover:bg-zinc-800/50 flex-1 border border-gray-800"
            >
              This is the expected response
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMessage && (
          <motion.div
            key="thankyou"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute text-white text-md text-center"
          >
            Thank you! Your response has been noted.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
