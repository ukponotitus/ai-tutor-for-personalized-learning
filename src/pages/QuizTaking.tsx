import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  Award,
  CheckCircle,
  Clock,
  Trophy,
  RotateCcw
} from 'lucide-react';

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  questions: any; // Will be parsed from JSONB
  total_questions: number;
  status: string;
  score: number | null;
  completed_at: string | null;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QuizTaking = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!quizId || !user) return;
    fetchQuiz();
  }, [quizId, user]);

  const fetchQuiz = async () => {
    if (!quizId || !user) return;

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching quiz:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive",
        });
        return;
      }

      setQuiz({
        ...data,
        questions: typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions
      });
      if (data.status === 'completed') {
        setShowResults(true);
        setScore(data.score || 0);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!quiz || !user) return;

    const calculatedScore = quiz.questions.reduce((acc, question, index) => {
      return answers[index] === question.correctAnswer ? acc + 1 : acc;
    }, 0);

    const percentage = Math.round((calculatedScore / quiz.questions.length) * 100);

    try {
      const { error } = await supabase
        .from('quizzes')
        .update({
          status: 'completed',
          score: percentage,
          completed_at: new Date().toISOString()
        })
        .eq('id', quiz.id);

      if (error) {
        console.error('Error submitting quiz:', error);
        toast({
          title: "Error",
          description: "Failed to submit quiz",
          variant: "destructive",
        });
        return;
      }

      setScore(percentage);
      setShowResults(true);
      toast({
        title: "Quiz Completed!",
        description: `You scored ${percentage}%`,
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const resetQuiz = async () => {
    if (!quiz) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .update({
          status: 'pending',
          score: null,
          completed_at: null
        })
        .eq('id', quiz.id);

      if (error) {
        console.error('Error resetting quiz:', error);
        return;
      }

      setAnswers({});
      setCurrentQuestion(0);
      setShowResults(false);
      setScore(0);
      toast({
        title: "Quiz Reset",
        description: "You can now retake the quiz",
      });
    } catch (error) {
      console.error('Error resetting quiz:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Quiz Not Found</h2>
          <p className="text-muted-foreground">
            The quiz you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (showResults) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {score >= 80 ? (
                  <Trophy className="h-16 w-16 text-yellow-500" />
                ) : score >= 60 ? (
                  <Award className="h-16 w-16 text-blue-500" />
                ) : (
                  <RotateCcw className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-2xl">Quiz Results</CardTitle>
              <div className="text-4xl font-bold mt-4">
                {score}%
              </div>
              <p className="text-muted-foreground">
                {score >= 80 ? "Excellent work!" : 
                 score >= 60 ? "Good job!" : "Keep studying!"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{quiz.questions.length}</div>
                  <div className="text-sm text-muted-foreground">Total Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {quiz.questions.reduce((acc, question, index) => 
                      answers[index] === question.correctAnswer ? acc + 1 : acc, 0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {quiz.questions.length - quiz.questions.reduce((acc, question, index) => 
                      answers[index] === question.correctAnswer ? acc + 1 : acc, 0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-center gap-4">
                <Button onClick={resetQuiz} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
                <Button onClick={() => window.history.back()}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <Card>
            <CardHeader>
              <CardTitle>Review Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Badge variant={answers[index] === question.correctAnswer ? "default" : "destructive"}>
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div 
                            key={optionIndex}
                            className={`p-2 rounded text-sm ${
                              optionIndex === question.correctAnswer 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : answers[index] === optionIndex 
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-muted'
                            }`}
                          >
                            {option}
                            {optionIndex === question.correctAnswer && (
                              <CheckCircle className="h-4 w-4 inline ml-2" />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const allQuestionsAnswered = quiz.questions.every((_, index) => answers[index] !== undefined);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{quiz.title}</CardTitle>
              <Badge variant="outline">
                {currentQuestion + 1} of {quiz.questions.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{currentQ.question}</h3>
              
              <RadioGroup
                value={answers[currentQuestion]?.toString()}
                onValueChange={(value) => 
                  setAnswers(prev => ({ ...prev, [currentQuestion]: parseInt(value) }))
                }
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              {isLastQuestion ? (
                <Button 
                  onClick={submitQuiz}
                  disabled={!allQuestionsAnswered}
                  className="gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Submit Quiz
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={answers[currentQuestion] === undefined}
                >
                  Next
                </Button>
              )}
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded ${
                    index < currentQuestion 
                      ? 'bg-primary' 
                      : index === currentQuestion 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default QuizTaking;