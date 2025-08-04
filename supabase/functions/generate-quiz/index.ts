import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseId, courseTitle, courseCategory, userId } = await req.json();

    if (!courseId || !courseTitle || !userId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Generating quiz for course:', courseTitle);

    // Generate quiz using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const quizPrompt = `Generate a comprehensive quiz for a course titled "${courseTitle}" in the category "${courseCategory}". 

Create 10 multiple-choice questions that test understanding of key concepts. Each question should have:
- A clear, specific question
- 4 answer options (A, B, C, D)
- One correct answer
- Questions should cover different aspects of the subject

Return the response as a JSON object with this structure:
{
  "title": "Quiz: ${courseTitle}",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make the questions practical and test real understanding, not just memorization.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in creating effective quizzes that test practical understanding.'
          },
          {
            role: 'user',
            content: quizPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    const quizContent = JSON.parse(aiResponse.choices[0].message.content);

    console.log('Quiz generated successfully, saving to database...');

    // Save quiz to database
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        course_id: courseId,
        user_id: userId,
        title: quizContent.title,
        questions: quizContent.questions,
        total_questions: quizContent.questions.length,
        status: 'pending'
      })
      .select()
      .single();

    if (quizError) {
      console.error('Error saving quiz:', quizError);
      throw new Error(`Failed to save quiz: ${quizError.message}`);
    }

    console.log('Quiz saved successfully with ID:', quiz.id);

    return new Response(JSON.stringify({ 
      success: true, 
      quizId: quiz.id,
      message: 'Quiz generated and saved successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});