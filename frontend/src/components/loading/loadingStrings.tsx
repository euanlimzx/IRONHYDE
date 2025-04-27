import React, { useState, useEffect } from "react";

const LoadingStrings = () => {
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
    "Hope your internet connection is as patient as you are while I check for errors.",
    "So far, so good... but I’ll keep checking just to be sure.",
  ];

  const getRandomIndex = (exclude) => {
    let index;
    do {
      index = Math.floor(Math.random() * strings.length);
    } while (index === exclude);
    return index;
  };

  const [currentIndex, setCurrentIndex] = useState(() => getRandomIndex(-1));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeoutId;

    const updateString = () => {
      setIsVisible(false);
      timeoutId = setTimeout(() => {
        setCurrentIndex((prevIndex) => getRandomIndex(prevIndex));
        setIsVisible(true);
        timeoutId = setTimeout(updateString, 3000);
      }, 1000);
    };

    updateString();

    return () => clearTimeout(timeoutId);
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
