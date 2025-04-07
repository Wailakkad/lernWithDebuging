"use client";

import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { CodeBlock } from '@/components/ui/code-block';
import { toast } from 'sonner'; 
import { SaveSubmissions } from '@/utils/SaveRequest';
import { SaveExercises } from '@/utils/SaveExercices';
import { SaveExerciseParams } from '@/utils/SaveExercices';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import Link from 'next/link';


interface DebugRequest {
  code: string;
  error?: string;
  language?: string;
  generateExercises: boolean;
  generateExercisesCount: number;
  generateExercisesLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface DebugExercise {
  description: string;
  solution?: string;
}

interface DebugResponse {
  originalCode: string;
  correctedCode: string;
  explanations: {
    errorAnalysis: string;
    fixExplanation: string;
  };
  exercises?: DebugExercise[];
}

interface DebugError {
  error: string;
  details?: string;
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
] as const;

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

export default function CodeDebugger() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState<DebugResponse | DebugError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Exercise generation state
  const [generateExercises, setGenerateExercises] = useState(false);
  const [exercisesCount, setExercisesCount] = useState(3);
  const [exercisesLevel, setExercisesLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  // Expanded exercises state
  const [expandedExercises, setExpandedExercises] = useState<number[]>([]);
  
 
  const toggleExercise = useCallback((index: number) => {
    setExpandedExercises(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter your code to debug'); // Updated toast
      return;
    }

    setIsLoading(true);
    setResult(null);
    setExpandedExercises([]);
    
    const requestData: DebugRequest = {
      code,
      error,
      language,
      generateExercises,
      generateExercisesCount: generateExercises ? exercisesCount : 0,
      generateExercisesLevel: exercisesLevel,
    };

    try {
      const response = await axios.post<DebugResponse>('http://localhost:3001/api/debug', requestData);
      setResult(response.data);
      console.log('Debugging result:', response.data);
      
      toast.success('Code analyzed successfully'); // Updated toast
    } catch (err) {
      const error = err as AxiosError<DebugError>;
      console.error('Debugging failed:', error);
      
      setResult({
        error: 'Debugging failed',
        details: error.response?.data?.details || error.message
      });
      
      toast.error('Failed to analyze code'); // Updated toast
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast("Code copied to clipboard");
  }, []);

  const handleSaveSubmission = async () => {
    if (!isDebugResponse(result)) {
      toast.error('No valid result to save');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Map difficulty level from UI to backend format
      const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
        'beginner': 'easy',
        'intermediate': 'medium',
        'advanced': 'hard'
      };
      
      await SaveSubmissions({
        originalCode: result.originalCode || '', // ensure string
        correctedCode: result.correctedCode || '', // ensure string
        errorType: typeof error === 'string' ? error : 'Unknown error', // force string
        language: language || 'javascript', // default
        errorAnalysis: {
          description: result.explanations?.errorAnalysis || '',
          solutionSteps: [result.explanations?.fixExplanation || '']
        },
        exerciseRequest: {
          count: generateExercises ? (exercisesCount || 0) : 1, // extra safety
          difficulty: difficultyMap[exercisesLevel] || 'medium'
        }
      });
      
      toast.success('Submission saved successfully!');
    } catch (err) {
      console.error('Error saving submission:', err);
      toast.error('Failed to save submission');
    } finally {
      setIsSaving(false);
    }
  };
 

  const hadleExercisesSave = async () => {
    if (!isDebugResponse(result) || !result.exercises?.length) {
      toast.error('No exercises to save');
      return;
    }
  
    setIsSaving(true);
    try {
      const exercisesToSave: SaveExerciseParams = {
        exercises: result.exercises.map((exercise) => ({
          description: exercise.description || 'Exercise description here',
          solution: {
            code: exercise.solution || '',
          },
          difficulty: 'medium',
          language: 'javascript',
        })),
      };
  
      await SaveExercises(exercisesToSave);
      toast.success('Exercises saved successfully!');
    } catch (err) {
      console.error('Error saving exercises:', err);
      toast.error('Failed to save exercises');
    } finally {
      setIsSaving(false);
    }
  };

  const isDebugResponse = (result: DebugResponse | DebugError | null): result is DebugResponse => {
    return result !== null && 'correctedCode' in result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100">
      <header className="border-b border-gray-800 py-4 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Icons.logo/>
            <div>
              <h1 className="text-xl font-bold text-green-400">Code Debugger AI</h1>
              <p className="text-sm text-gray-400">Intelligent debugging powered by AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Icons.help className="h-4 w-4 mr-2" />
              Help
            </Button>
         <Link href="/pages/profile">
         <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Icons.dashboard className="h-5 w-5 mr-2" />
              Dashbord
            </Button>
         </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-gray-800 bg-gray-900/70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Debug Request</CardTitle>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    AI Powered
                  </Badge>
                </div>
                <CardDescription>Enter your code and error message for analysis</CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Programming Language</Label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="flex h-10 w-full bg-gray-800/70 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                    >
                      {languageOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="code">Code with Error</Label>
                      <span className="text-xs text-gray-400">Required</span>
                    </div>
                    <Textarea
                      id="code"
                      rows={10}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-gray-800/70 border border-gray-700 font-mono text-sm"
                      placeholder="// Paste your code here..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="error">Error Message</Label>
                      <span className="text-xs text-gray-400">Optional</span>
                    </div>
                    <Textarea
                      id="error"
                      rows={3}
                      value={error}
                      onChange={(e) => setError(e.target.value)}
                      className="w-full bg-gray-800/70 border border-gray-700 font-mono text-sm"
                      placeholder="// Paste the error message you received..."
                    />
                  </div>

                {/* Exercise Generation Section */}
<Card className="bg-gray-800/70 border border-green-500/30 shadow-md shadow-green-500/10">
  <CardHeader className="p-4">
    <div className="flex items-center space-x-3">
      <Switch
        id="generateExercises"
        checked={generateExercises}
        onCheckedChange={setGenerateExercises}
        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-400"
      />
      <Label htmlFor="generateExercises" className="text-green-400 font-medium">
        Generate Practice Exercises <span className="text-xs text-gray-400">(with solutions)</span>
      </Label>
    </div>
  </CardHeader>
  
  {generateExercises && (
    <CardContent className="pt-0 space-y-4 pl-12">
      <div className="space-y-2">
        <Label htmlFor="exercisesCount" className="text-sm text-gray-300">
          Number of Exercises (1-10)
        </Label>
        <Input
          type="number"
          id="exercisesCount"
          min="1"
          max="10"
          value={exercisesCount}
          onChange={(e) => setExercisesCount(parseInt(e.target.value))}
          className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500/30"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm text-gray-300">Difficulty Level</Label>
        <div className="flex gap-2 flex-wrap">
          {difficultyLevels.map((level) => (
            <Button
              key={level.value}
              type="button"
              variant={exercisesLevel === level.value ? 'secondary' : 'ghost'}
              size="sm"
              className={`px-3 rounded-full ${
                exercisesLevel === level.value 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-medium'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
              onClick={() => setExercisesLevel(level.value)}
            >
              {level.label}
            </Button>
          ))}
        </div>
      </div>
    </CardContent>
  )}
</Card>

                  <Button
                    type="submit"
                    disabled={isLoading || !code.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Code...
                      </>
                    ) : (
                      <>
                        <Icons.debug className="mr-2 h-4 w-4" />
                        Debug Code
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Tips Section */}
            <Card className="border-gray-800 bg-gray-900/70">
              <CardHeader className="p-4">
                <div className="flex items-center space-x-2">
                  <Icons.tip className="h-4 w-4 text-blue-400" />
                  <CardTitle className="text-sm font-medium">Pro Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="text-xs text-gray-400 space-y-2">
                  <li className="flex items-center  gap-2">
                    <Icons.dot />
                    <span>Include the complete error message for better analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.dot />
                    <span>Make sure your code contains the entire function or class with proper context</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.dot  />
                    <span>The AI works best with self-contained code snippets that can be analyzed independently</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <Card className="border-gray-800 bg-gray-900/70 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Debug Results</CardTitle>
                  <CardDescription>AI analysis and solution</CardDescription>
                </div>
                {isDebugResponse(result) && (
                  <div className='flex items-center space-x-2'>
                    <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                    onClick={handleSaveSubmission}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {/* <Icons.save className="mr-2 h-4 w-4" /> */}
                        Save Solution
                      </>
                    )}
                  </Button>
                  {
                    result.exercises && result.exercises.length > 0 && (
                      <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                      onClick={hadleExercisesSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          {/* <Icons.save className="mr-2 h-4 w-4" /> */}
                          Save exercices
                        </>
                      )}
                    </Button>
                    )
                  }
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="h-[calc(100%-120px)]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Icons.loader className="h-12 w-12 text-green-400/70 animate-pulse" />
                  <p className="text-gray-400">Processing your code</p>
                  <p className="text-xs text-gray-500">This may take a few moments...</p>
                </div>
              ) : result ? (
                isDebugResponse(result) ? (
                  <Tabs defaultValue="analysis" className="h-full">
                    <TabsList className="bg-gray-800/50 border-b border-gray-700 w-full justify-start px-4">
                      <TabsTrigger value="analysis" className="flex items-center">
                        <Icons.analysis className="h-4 w-4 mr-2" />
                        Analysis
                      </TabsTrigger>
                      <TabsTrigger value="fix" className="flex items-center">
                        <Icons.solution className="h-4 w-4 mr-2" />
                        Solution
                      </TabsTrigger>
                      <TabsTrigger value="corrected" className="flex items-center">
                        <Icons.code className="h-4 w-4 mr-2" />
                        Fixed Code
                      </TabsTrigger>
                      {result.exercises && result.exercises.length > 0 && (
                        <TabsTrigger value="exercises" className="flex items-center">
                          <Icons.exercise className="h-4 w-4 mr-2" />
                          Exercises
                          <Badge className="ml-2 bg-green-500/30 text-green-400">
                            {result.exercises.length}
                          </Badge>
                        </TabsTrigger>
                      )}
                    </TabsList>
                    
                    <div className="h-full overflow-y-auto pt-4">
                      <TabsContent value="analysis">
                        <Card className="border-gray-700 bg-gray-800/50">
                          <CardHeader className="flex-row items-center justify-between pb-3">
                            <CardTitle className="text-green-400">Error Analysis</CardTitle>
                            <Badge variant="outline" className="text-gray-400">
                              AI Generated
                            </Badge>
                          </CardHeader>
                          <CardContent className="whitespace-pre-wrap text-sm">
                            {result.explanations.errorAnalysis || 'No analysis provided'}
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="fix">
                        <Card className="border-gray-700 bg-gray-800/50">
                          <CardHeader className="flex-row items-center justify-between pb-3">
                            <CardTitle className="text-green-400">Solution Explanation</CardTitle>
                            <Badge variant="outline" className="text-gray-400">
                              AI Generated
                            </Badge>
                          </CardHeader>
                          <CardContent className="whitespace-pre-wrap text-sm">
                            {result.explanations.fixExplanation || 'No explanation provided'}
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="corrected">
                        <Card className="border-gray-700 bg-gray-800/50">
                          <CardHeader className="flex-row items-center justify-between pb-3">
                            <CardTitle className="text-green-400">Corrected Code</CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(result.correctedCode)}
                            >
                              <Icons.copy className="h-4 w-4 mr-2" />
                              Copy Code
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <CodeBlock 
                              code={result.correctedCode} 
                              language={language} 
                              className="max-h-[500px]"
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      {result.exercises && result.exercises.length > 0 && (
                        <TabsContent value="exercises" className="space-y-4">
                          {result.exercises.map((exercise, index) => (
                            <Card key={index} className="border-gray-700 bg-gray-800/50">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm font-medium">
                                    Exercise {index + 1}
                                  </CardTitle>
                                  <Badge 
                                    variant="outline"
                                    className={`
                                      ${exercisesLevel === 'beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                                      ${exercisesLevel === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                                      ${exercisesLevel === 'advanced' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                                    `}
                                  >
                                    {exercisesLevel}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Description</h4>
                                  <p className="text-sm">{exercise.description}</p>
                                </div>
                                
                                
                                
                                {expandedExercises.includes(index) && exercise.solution && (
                                  <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-sm font-medium">Solution</h4>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(exercise.solution!)}
                                      >
                                        <Icons.copy className="h-4 w-4 mr-2" />
                                        Copy
                                      </Button>
                                    </div>
                                    <CodeBlock 
                                      code={exercise.solution} 
                                      language={language} 
                                      className="max-h-[300px]"
                                    />
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleExercise(index)}
                                >
                                  {expandedExercises.includes(index) ? (
                                    <>
                                      <Icons.chevronUp className="h-4 w-4 mr-2" />
                                      Hide Solution
                                    </>
                                  ) : (
                                    <>
                                      <Icons.chevronDown className="h-4 w-4 mr-2" />
                                      Show Solution
                                    </>
                                  )}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </TabsContent>
                      )}
                    </div>
                  </Tabs>
                ) : (
                  <Card className="border-red-500/30 bg-red-500/10">
                    <CardHeader>
                      <CardTitle className="text-red-400">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-400">{result.error}</p>
                      {result.details && (
                        <pre className="mt-2 text-sm text-red-300 whitespace-pre-wrap">
                          {result.details}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Icons.code className="h-12 w-12 mb-4 opacity-30" />
                  <p>Submit your code to see the debug results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}