import React, { useState, useEffect, useRef } from 'react';
import { evaluate } from 'mathjs';
import { Equation, parse } from 'algebra.js'
import './App.css';


function App() {
  const [result, setResult] = useState('');
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
      if (event.key === 'Enter' && result.length > 0) {
        if (result.toLowerCase() === "clear") {
          clearhistory();
        } else {
          calculate();
        }
      } else if (event.key === 'Escape') {
        setResult("");
      }  else if (event.key === 'ArrowUp') { // Navigate history with up arrow or 'w' key
        navigateHistory(-1);
      } else if (event.key === 'ArrowDown') { // Navigate history with down arrow or 's' key
        navigateHistory(1);
      }
    };

    const clearhistory = () => {
      setHistory([]);
      setResult("");
    }

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

  const findanswer = () => {
    let solved;
    let equatparse = result.match(/^(\w*) in (.+)\s+=\s*(.+)$/);
    if (equatparse) {
      let eqatvar = equatparse[1] || "x";
      let parsed;

      try { //solve 
        parsed = parse(equatparse[2]);
        let equation = new Equation(parsed, parse(equatparse[3]));
        solved = equation.solveFor(eqatvar).toString();
      } catch (error) {
        if (error == "EvalError: No Solution") {
          solved = "unsolvable."
        } else {
          console.warn(error)
          return;
        }
      }

      return equatparse[2] + ' = ' + equatparse[3] + ', ' + eqatvar + ' is ' + solved;
    } else {

      try { //normal
        solved = evaluate(result).toString();
      } catch (error) {
        console.warn(error)
        return;
      }

      return result + ' = ' + solved;
    }
  }

  const calculate = () => {
    var answer = findanswer();
    if (answer) {
      setHistory(prevHistory => [...prevHistory, answer]);
      setHistoryIndex(-1); // Reset history navigation after calculation
      setResult("");
    }
  };

  const handleChange = (event) => {
    setResult(event.target.value);
  };

  return (
    <div className="calculator">
      <input className="display" id="result" type="text" placeholder="0" value={result} onChange={handleChange}/>
      <div className="history" ref={historyRef}> 
        {history.length === 0 ? (
          <a href = "https://github.com/allclients2/x" className="nohistory">React Calculator by BCV</a> // Me name of course YEAhhhh
        ) : (
          history.map((calculation, index) => (
            <div key={index}>{calculation}</div>
          ))
        )}
      </div>
      <div className="keyboard-listener"></div>
    </div>
  );
}

export default App;
