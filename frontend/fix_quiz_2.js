const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'quiz', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The misplaced block to remove
const blockToRemove = `  // ── Handle Option Change (AI / Manual) ────────────────────────────────────
  const handleOptionChange = (qIdx: number, option: string) => {
    if (submitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = option;
    setUserAnswers(newAnswers);
  };

  // ── Submit Quiz (AI / Manual) ─────────────────────────────────────────────
  const submitQuiz = async () => {
    let currentScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) currentScore++;
    });
    setScore(currentScore);
    setSubmitted(true);

    try {
      await api.post("/quiz/submit", {
        subject,
        topic,
        difficulty,
        questions,
        score: currentScore,
        total: questions.length,
      });
    } catch (err) {
      console.error("Failed to submit quiz results:", err);
    }
  };
`;

// It might be separated by a \n or \r\n, let's normalize the file content to \n for easier manipulation
content = content.replace(/\r\n/g, '\n');

// 1. Remove the block
content = content.replace(blockToRemove, '');
content = content.replace('  return () => {\n      if (timerRef.current) clearInterval(timerRef.current);', '    return () => {\n      if (timerRef.current) clearInterval(timerRef.current);');


// 2. Add the block before the return (
const idx = content.indexOf('  return (\n    <ProtectedRoute>');
if (idx > -1) {
  content = content.slice(0, idx) + blockToRemove + '\n' + content.slice(idx);
} else {
  console.log("Could not find insertion marker.");
}

// Convert back to CRLF if needed, though most editors can handle \n
// fs.writeFileSync(filePath, content, 'utf-8');
fs.writeFileSync(filePath, content.replace(/\n/g, '\r\n'), 'utf-8');
console.log('SUCCESS');
