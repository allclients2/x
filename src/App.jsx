import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // Track history navigation
  const historyRef = useRef(null); // Ref for history box

  const scrollToBottom = () => {
    const element = historyRef.current;
    const duration = 200; // 0.2 seconds
    const start = element.scrollTop;
    const target = element.scrollHeight - element.clientHeight;
    let startTime = null;

    const animateScroll = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = currentTime - startTime;
      const scrollY = Math.floor(easeInOutQuad(progress, start, target - start, duration));
      element.scrollTop = scrollY;
      if (progress < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };

  useEffect(() => {
    if (historyRef.current) {
      scrollToBottom();
    }
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        calculate();
      } else if (event.key === 'Escape') {
        setResult("");
      } else if (event.key === 'Backspace') {
        backspace();
      } else if (event.key === 'ArrowUp' || event.key === 'w') { // Navigate history with up arrow or 'w' key
        navigateHistory(-1);
      } else if (event.key === 'ArrowDown' || event.key === 's') { // Navigate history with down arrow or 's' key
        navigateHistory(1);
      } else if (event.key.length === 1) {
        setResult(prevResult => prevResult === '0' ? event.key : prevResult + event.key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [result]);

  const navigateHistory = (increment) => {
    const newIndex = historyIndex + increment;
    if (newIndex >= 0 && newIndex < history.length) {
      setHistoryIndex(newIndex);
      setResult(history[newIndex].split('=')[0].trim()); // Set result from history
    } else if (newIndex === -1) { // Reset to current input if at the end of history
      setHistoryIndex(newIndex);
      setResult('');
    }
  };

  const calculate = () => {
    var calculatedResult;
    try {
      calculatedResult = eval(result);
    } catch (error) {
      return;
    }
    setHistory(prevHistory => [...prevHistory, result + ' = ' + calculatedResult]);
    setHistoryIndex(-1); // Reset history navigation after calculation
    setResult("");
  };

  const backspace = () => {
    setResult(prevResult => prevResult.length === 1 ? '0' : prevResult.slice(0, -1));
  };

  return (
    <div className="calculator">
      <input className="display" id="result" type="text" value={result} readOnly />
      <div className="history" ref={historyRef}>
        {history.map((calculation, index) => (
          <div key={index}>{calculation}</div>
        ))}
      </div>
      <div className="keyboard-listener"></div>
    </div>
  );
}

export default App;
