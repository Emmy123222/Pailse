import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  examType: string;
}

function extractJsonFromText(text: string): any {
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket === -1 || lastBracket === -1) {
    throw new Error('JSON array not found in model response');
  }

  const jsonString = text.substring(firstBracket, lastBracket + 1);
  return JSON.parse(jsonString);
}

export async function generateQuestions(
  examType: string,
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 10
): Promise<Question[]> {
  try {
    const prompt = `Generate ${count} ${difficulty} level practice questions for the ${examType} exam in the ${category} category. 
    
    For each question, provide:
    1. A clear, specific question
    2. 5 multiple choice options (A, B, C, D, E)
    3. The correct answer (just the letter)
    4. A detailed explanation
    
    Format as a JSON array with this structure:
    [
      {
        "question": "Question text",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4", "E) Option 5"],
        "correctAnswer": "A",
        "explanation": "Detailed explanation"
      }
    ]`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content generated');

    const parsed = extractJsonFromText(content);

    return parsed.map((q: any, index: number) => ({
      id: `q_${Date.now()}_${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty,
      category,
      examType
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

export async function generateFlashcards(
  examType: string,
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 20
): Promise<{ question: string; answer: string }[]> {
  try {
    const prompt = `Generate ${count} flashcard questions for the ${examType} exam in the ${category} category at ${difficulty} level.
    
    Format as a JSON array:
    [
      {
        "question": "Question or term",
        "answer": "Answer or definition"
      }
    ]`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // ✅ Updated model
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content generated');

    const parsed = extractJsonFromText(content);

    return parsed;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}
