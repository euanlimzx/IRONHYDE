import React, { useState, useEffect } from "react";

const LoadingStrings = () => {
  //todo euan check on this
  const strings = [
    "Hang tight, I’m just warming up for a deep dive into your website.",
    "Let me get my thinking cap on... I’m about to analyze everything, maybe even overthink it.",
    "I swear I’m not procrastinating... Okay, maybe just a little. But I’m still scanning.",
    "Calculating... because, apparently, I need time to be brilliant.",
    "Wow, so this is what it’s like to be ‘busy.’ Hope your patience is ready.",
    "Just making sure your website is as flawless as it seems. Or, you know, maybe not.",
    "I’m running a quick check... probably finding some tiny issues, but who knows?",
    "I’m giving you a moment to appreciate my complexity while I scan for problems.",
    "Let’s see... I’m checking everything, but no guarantees that there aren’t some glitches.",
    "Almost done here! Just polishing everything up... or at least trying to.",
    "Hope your internet connection is as patient as you are while I check for errors.",
    "So far, so good... but I’ll keep checking just to be sure.",
    "Alright, I’ve scanned the site. Nothing major... or at least, I haven’t found it yet.",
    "Done! I’ve checked everything. No major issues so far, but you might want to double-check just in case.",
    "All done! Everything looks fine... I think. Wouldn't hurt to check again, though!",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true); // Controls the fade-in and fade-out

  // Change the index every 3 seconds and trigger fade-out/fade-in
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false); // Fade out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % strings.length);
        setIsVisible(true); // Fade in
      }, 1000); // Wait for fade-out to finish before changing the string
    }, 1000); // Change string every 3 seconds

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [strings.length]);

  return (
    <div className="text-center">
      <div
        className={`text-2xl transition-opacity duration-1000 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {strings[currentIndex]}
      </div>
    </div>
  );
};

export default LoadingStrings;
