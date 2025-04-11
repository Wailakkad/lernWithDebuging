// app/dashboard/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { useProtectedRoute } from '@/hooks/useProtectRoute';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Icons - only import what we use
import { 
  Code2, 
  Terminal, 
  User, 
  FileCode, 
  Dumbbell,
  BarChart3, 
  Settings, 
  LogOut, 
  Home,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Copy,
  AlertCircle,
  ArrowLeft,
  Check as CheckCircle, // Renamed to fix import issue
  Code as CodeIcon, // Renamed to fix import issue
  Lightbulb
} from 'lucide-react';
import axios from 'axios';

// Types
interface ApiUser {
  _id: string;
  username: string;
  email: string;
  developerType: string;
  experienceLevel: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  joinDate: string;
  debugCount: number;
  exerciseCount: number;
  languages: {
    name: string;
    level: string;
  }[];
}

interface ErrorAnalysis {
  description: string;
  solutionSteps: string[];
  _id: string;
}

interface ExerciseRequest {
  count: number;
  difficulty: string;
  _id: string;
}

interface DebuggingSolution {
  _id: string;
  userId: string;
  originalCode: string;
  errorType: string;
  language: string;
  correctedCode: string;
  errorAnalysis: ErrorAnalysis;
  exerciseRequest: ExerciseRequest;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiSubmissionsResponse {
  message: string;
  submissions: DebuggingSolution[];
}

interface Exercise {
  id: string;
  language: string;
  title: string;
  difficulty: string;
  status: string;
  date: string;
  description?: string;
  fullDescription?: string;
  solution?: {
    code?: string;
  };
}

const API_BASE_URL = 'http://localhost:3001/api/actions';

export default function DeveloperDashboard() {
  useProtectedRoute();
  const {logout} = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [debuggingSolutions, setDebuggingSolutions] = useState<DebuggingSolution[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  const fetchUserData = async () => {
    try {
      const { data } = await axios.get<{ message: string; user: ApiUser }>(
        `${API_BASE_URL}/getUser`,
        { withCredentials: true }
      );

      if (!data.user) {
        throw new Error('User data not found in response');
      }

      // Transform API response to match frontend interface
      const transformedUser: UserProfile = {
        name: data.user.username,
        email: data.user.email,
        role: data.user.developerType,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.username)}&background=random&color=fff`,
        joinDate: format(new Date(data.user.createdAt), 'MMMM yyyy'),
        debugCount: 0,
        exerciseCount: 0,
        languages: [
          { name: 'JavaScript', level: 'Intermediate' },
          { name: 'TypeScript', level: 'Intermediate' },
          { name: 'Python', level: 'Advanced' },
          { name: 'React', level: 'Beginner' },
        ]
      };

      setUser(transformedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading user profile');
      console.error(err);
    }
  };
  
  const fetchDebuggingSolutions = async () => {
    try {
      const { data } = await axios.get<ApiSubmissionsResponse>(
        `${API_BASE_URL}/getSubmissions`,
        { withCredentials: true }
      );
  
      if (!data.submissions) {
        throw new Error('No submissions data found');
      }
  
      setDebuggingSolutions(data.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading debugging solutions');
      console.error(err);
    }
  };
  
  const fetchExercises = async () => {
    try {
      const { data } = await axios.get<{ 
        message: string; 
        exercises: Array<{
          _id: string;
          userId: string;
          exercises: Array<{
            description: string;
            difficulty: string;
            language: string;
            status : string
            _id: string;
            solution?: {
              code: string;
              _id: string;
            };
          }>;
          createdAt: string;
          updatedAt: string;
        }> 
      }>(
        `${API_BASE_URL}/getExercises`,
        { withCredentials: true }
      );
  
      if (data.exercises) {
        // Transform the API response to match your frontend interface
        const transformedExercises: Exercise[] = data.exercises.flatMap(request => 
          request.exercises.map(ex => ({
            id: ex._id,
            language: ex.language,
            title: ex.description.substring(0, 50) + (ex.description.length > 50 ? '...' : ''),
            difficulty: ex.difficulty,
            status: ex.status, // Randomize for demo
            date: format(new Date(request.createdAt), 'MMM dd, yyyy'),
            description: ex.description,
            fullDescription: ex.description, // Added this field
            solution: ex.solution ? { code: ex.solution.code } : undefined
          }))
        );
        
        setExercises(transformedExercises);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading exercises');
      console.error(err);
    }
  };
  
  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUserData(),
          fetchDebuggingSolutions(),
          fetchExercises()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, []);

  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsExerciseModalOpen(true);
  };

  // Use memoization to prevent unnecessary re-filtering
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      if (selectedFilter === "all") return true;
      return exercise.status.toLowerCase() === selectedFilter.toLowerCase();
    });
  }, [exercises, selectedFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#081c15' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto" style={{ borderColor: '#ccff33' }}></div>
          <p className="mt-4 text-gray-400" style={{ color: '#d8f3dc' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#081c15' }}>
        <Card className="w-96 border-gray-800" style={{ backgroundColor: '#0a2e23', borderColor: '#52b788' }}>
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: '#d8f3dc' }}>{error || "Failed to load dashboard data"}</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full text-white"
              style={{ backgroundColor: '#52b788', color: '#081c15' }}
            >
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Common style objects to avoid repetition
  const styles = {
    card: { backgroundColor: '#0a2e23', borderColor: '#52b788' },
    darkBg: { backgroundColor: '#081c15' },
    text: { color: '#d8f3dc' },
    subtext: { color: '#52b788' },
    accent: { color: '#ccff33' },
    button: { borderColor: '#52b788', color: '#d8f3dc' },
    accentButton: { backgroundColor: '#ccff33', color: '#081c15' }
  };

  return (
    <div className="flex h-screen" style={styles.darkBg}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r" style={{ backgroundColor: 'black', borderColor: '#52b788' }}>
        <div className="p-4 flex items-center space-x-2 border-b" style={{ borderColor: '#52b788' }}>
          <Code2 className="h-6 w-6" style={styles.accent} />
          <h1 className="text-lg font-semibold" style={styles.accent}>DevDebugger</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {[
              { name: "overview", icon: Home, label: "Overview" },
              { name: "debugging", icon: Terminal, label: "Debugging Solutions" },
              { name: "exercises", icon: Dumbbell, label: "Exercises" },
              { name: "progress", icon: BarChart3, label: "Progress" }
            ].map((item) => (
              <Button 
                key={item.name}
                variant="ghost" 
                className="w-full justify-start hover:bg-opacity-20"
                style={{ 
                  color: activeTab === item.name ? styles.accent.color : styles.text.color, 
                  backgroundColor: activeTab === item.name ? 'rgba(204, 255, 51, 0.1)' : 'transparent' 
                }}
                onClick={() => item.name !== "progress" && setActiveTab(item.name)}
              >
                <item.icon className="h-5 w-5 mr-3" style={{ color: activeTab === item.name ? styles.accent.color : styles.subtext.color }} />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t" style={{ borderColor: '#52b788' }}>
          {[
            { icon: Settings, label: "Settings" , action : undefined },
            { icon: LogOut, label: "Logout" , action :()=> logout() }
          ].map((item, idx) => (
            <Button 
              key={idx}
              
              variant="ghost" 
              className="w-full justify-start hover:bg-opacity-20"
              onClick={item.action}
              style={styles.text}
            >
              <item.icon className="h-5 w-5 mr-3" style={styles.subtext} />
              {item.label}
            </Button>
          ))}
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" style={styles.darkBg}>
        {/* Top header with user info */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 z-10" style={{ backgroundColor: 'black', borderColor: '#52b788' }}>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2" style={{ borderColor: '#ccff33' }}>
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback style={{ backgroundColor: 'rgba(204, 255, 51, 0.2)', color: '#ccff33' }}>
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-xl font-semibold" style={styles.text}>{user.name}</h2>
              <div className="flex items-center space-x-2 text-sm" style={styles.subtext}>
                <span>{user.role}</span>
                <span>•</span>
                <span>Member since {user.joinDate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" style={styles.button} className="hover:border-opacity-80">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            
           <Link href="/pages/debuging_page">
           <Button  style={styles.accentButton} className="hover:bg-opacity-90">
              <Terminal className="h-4 w-4 mr-2" />
              New Debug Session
            </Button>
           </Link>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats cards */}
                {[
                  { 
                    title: "Debug Sessions", 
                    value: debuggingSolutions.length, 
                    delta: "+3 this week" 
                  },
                  { 
                    title: "Completed Exercises", 
                    value: exercises.filter(ex => ex.status === "Completed").length, 
                    delta: "+5 this week" 
                  },
                  { 
                    title: "Favorite Language", 
                    value: "TypeScript", 
                    delta: "23 sessions" 
                  },
                ].map((stat, idx) => (
                  <Card key={idx} style={styles.card}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-normal" style={styles.subtext}>{stat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold" style={styles.text}>{stat.value}</span>
                        <span style={styles.accent} className="text-sm">{stat.delta}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Skills & Languages */}
              <Card style={styles.card}>
                <CardHeader>
                  <CardTitle style={styles.text}>Programming Languages</CardTitle>
                  <CardDescription style={styles.subtext}>Your skills and proficiency levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {user.languages.map((lang, index) => {
                      const isAdvanced = lang.level === "Advanced";
                      const proficiencyWidth = 
                        lang.level === "Advanced" ? "90%" 
                        : lang.level === "Intermediate" ? "60%" 
                        : "30%";
                      
                      return (
                        <div key={index} className="rounded-lg p-4 flex flex-col" style={styles.darkBg}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium" style={styles.text}>{lang.name}</span>
                            <Badge style={{ 
                              backgroundColor: isAdvanced ? 'rgba(204, 255, 51, 0.2)' : 'rgba(82, 183, 136, 0.2)',
                              color: isAdvanced ? '#ccff33' : '#52b788',
                              borderColor: isAdvanced ? 'rgba(204, 255, 51, 0.3)' : 'rgba(82, 183, 136, 0.3)'
                            }}>
                              {lang.level}
                            </Badge>
                          </div>
                          
                          <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0a2e23' }}>
                            <div 
                              className="h-full"
                              style={{ 
                                width: proficiencyWidth,
                                backgroundColor: '#ccff33'
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card style={styles.card}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle style={styles.text}>Recent Debugging</CardTitle>
                      <Button 
                        variant="link" 
                        className="p-0"
                        style={styles.accent}
                        onClick={() => setActiveTab("debugging")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {debuggingSolutions.slice(0, 2).map((solution) => (
                        <div key={solution._id} className="flex flex-col space-y-4 p-4 rounded-lg transition-colors" style={styles.darkBg}>
                          <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(204, 255, 51, 0.15)' }}>
                              <FileCode className="h-6 w-6" style={styles.accent} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-lg" style={styles.text}>{solution.errorType}</h4>
                                <Badge style={{ backgroundColor: 'rgba(204, 255, 51, 0.15)', color: '#ccff33', borderColor: 'rgba(204, 255, 51, 0.3)' }}>
                                  Fixed
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 text-sm mt-1" style={styles.subtext}>
                                <span>{solution.language}</span>
                                <span>•</span>
                                <span>{new Date(solution.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" style={styles.button}>
                              View Details
                            </Button>
                          </div>
                          
                          <div className="bg-opacity-50 p-4 rounded-lg" style={{ backgroundColor: '#0a2e23' }}>
                            <h5 className="text-sm font-medium mb-2" style={styles.subtext}>Error Analysis</h5>
                            <p className="text-sm mb-2" style={styles.text}>{solution.errorAnalysis.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card style={styles.card}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle style={styles.text}>Recent Exercises</CardTitle>
                      <Button 
                        variant="link" 
                        className="p-0"
                        style={styles.accent}
                        onClick={() => setActiveTab("exercises")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {exercises.slice(0, 3).map((exercise) => (
                        <div key={exercise.id} className="flex items-center space-x-4 p-3 rounded-lg" style={styles.darkBg}>
                          <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(204, 255, 51, 0.15)' }}>
                            <Dumbbell className="h-5 w-5" style={styles.accent} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium" style={styles.text}>{exercise.title}</h4>
                              <Badge style={{ 
                                backgroundColor: exercise.status === "Completed" ? 'rgba(204, 255, 51, 0.15)' : 'rgba(82, 183, 136, 0.15)',
                                color: exercise.status === "Completed" ? '#ccff33' : '#52b788',
                                borderColor: exercise.status === "Completed" ? 'rgba(204, 255, 51, 0.3)' : 'rgba(82, 183, 136, 0.3)'
                              }}>
                                {exercise.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm mt-1" style={styles.subtext}>
                              <span>{exercise.language}</span>
                              <span>•</span>
                              <span>{exercise.difficulty}</span>
                              <span>•</span>
                              <span>{exercise.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {activeTab === "debugging" && (
            <Card style={styles.card}>
              <CardHeader>
                <CardTitle style={styles.text}>Debugging Solutions</CardTitle>
                <CardDescription style={styles.subtext}>Your history of fixed code issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debuggingSolutions.map((solution) => (
                    <div key={solution._id} className="flex flex-col space-y-4 p-4 rounded-lg transition-colors" style={styles.darkBg}>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(204, 255, 51, 0.15)' }}>
                          <FileCode className="h-6 w-6" style={styles.accent} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-lg" style={styles.text}>{solution.errorType}</h4>
                            <Badge style={{ backgroundColor: 'rgba(204, 255, 51, 0.15)', color: '#ccff33', borderColor: 'rgba(204, 255, 51, 0.3)' }}>
                              Fixed
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm mt-1" style={styles.subtext}>
                            <span>{solution.language}</span>
                            <span>•</span>
                            <span>{new Date(solution.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" style={styles.button}>
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" style={styles.button}>
                          Delete
                        </Button>
                        
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2e23' }}>
                          <h5 className="text-sm font-medium mb-2" style={styles.subtext}>Original Code</h5>
                          <pre className="text-xs overflow-x-auto p-2 rounded" style={{ color: '#d8f3dc', backgroundColor: '#081c15' }}>
                            {solution.originalCode}
                          </pre>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2e23' }}>
                          <h5 className="text-sm font-medium mb-2" style={styles.subtext}>Corrected Code</h5>
                          <pre className="text-xs overflow-x-auto p-2 rounded" style={{ color: '#d8f3dc', backgroundColor: '#081c15' }}>
                            {solution.correctedCode}
                          </pre>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2e23' }}>
                        <h5 className="text-sm font-medium mb-2" style={styles.subtext}>Error Analysis</h5>
                        <p className="text-sm mb-2" style={styles.text}>{solution.errorAnalysis.description}</p>
                        <ul className="list-disc list-inside text-sm space-y-1" style={styles.subtext}>
                          {solution.errorAnalysis.solutionSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t flex justify-center py-4" style={{ borderColor: '#52b788' }}>
                <Button 
                  variant="outline" 
                  style={styles.button}
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debugging-solutions?page=2');
                      if (!response.ok) throw new Error('Failed to load more');
                      const moreData = await response.json();
                      setDebuggingSolutions(prev => [...prev, ...moreData]);
                    } catch (err) {
                      console.error('Error loading more data:', err);
                    }
                  }}
                >
                  Load More
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === "exercises" && (
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#0a2e22', color: '#d8f3dc' }}>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle style={styles.text}>Coding Exercises</CardTitle>
                  <CardDescription style={{ color: '#a7c6bc' }}>Practice problems to improve your skills</CardDescription>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  {[
                    { id: "all", label: "All", icon: null },
                    { id: "completed", label: "Completed", icon: CheckCircle2 },
                    { id: "inprogress", label: "In Progress", icon: Clock }
                  ].map(filter => (
                    <Button 
                      key={filter.id}
                      variant="outline" 
                      className={`border ${selectedFilter === filter.id ? "text-white" : ""}`}
                      style={{ 
                        borderColor: selectedFilter === filter.id ? '#ccff33' : '#52b788', 
                        backgroundColor: selectedFilter === filter.id ? 'rgba(204, 255, 51, 0.1)' : 'transparent',
                        color: selectedFilter === filter.id ? '#ccff33' : '#d8f3dc' 
                      }}
                      onClick={() => setSelectedFilter(filter.id)}
                    >
                      {filter.icon && <filter.icon className="h-4 w-4 mr-2" />}
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredExercises.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4" style={{ color: '#52b788' }} />
                      <h4 className="text-lg font-medium" style={styles.text}>No exercises found</h4>
                      <p style={{ color: '#a7c6bc' }}>Try adjusting your filters or generate new exercises</p>
                    </div>
                  ) : (
                    filteredExercises.map((exercise) => (
                      <div key={exercise.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#0f3d2e' }}>
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full" style={{ backgroundColor: '#081c15' }}>
                            <CodeIcon className="h-5 w-5" style={styles.accent} />
                          </div>
                          <div>
                            <h4 className="font-medium" style={styles.text}>{exercise.title}</h4>
                         
                            <div className="flex items-center space-x-2 text-sm mt-1" style={styles.subtext}>
                              <span>{exercise.language}</span>
                              <span>•</span>
                              <span>{exercise.difficulty}</span>
                              <span>•</span>
                              <span>{exercise.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                          <Badge style={{ 
                            backgroundColor: exercise.status === "Completed" ? 'rgba(204, 255, 51, 0.15)' : 'rgba(82, 183, 136, 0.15)',
                            color: exercise.status === "Completed" ? '#ccff33' : '#52b788',
                            borderColor: exercise.status === "Completed" ? 'rgba(204, 255, 51, 0.3)' : 'rgba(82, 183, 136, 0.3)'
                          }}>
                            {exercise.status}
                          </Badge>
                          <Button 
                            variant="outline"
                            size="sm"
                            style={styles.button}
                            onClick={() => handleViewExercise(exercise)}
                          >
                            View Exercise
                          </Button>
                          <button  className='bg-red-500 text-white font-bold px-4 py-2 rounded-2xl'>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t flex justify-center py-4" style={{ borderColor: '#52b788' }}>
                <Button 
                  style={styles.accentButton}
                  className="hover:bg-opacity-90"
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Generate New Exercises
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === "progress" && (
            <Card style={styles.card}>
              <CardHeader>
                <CardTitle style={styles.text}>Progress Tracking</CardTitle>
                <CardDescription style={styles.subtext}>Track your learning journey</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 mb-4" style={styles.subtext} />
                  <h3 className="text-xl font-medium mb-2" style={styles.text}>Feature Coming Soon</h3>
                  <p className="max-w-md" style={styles.subtext}>
                    We're working on advanced progress tracking features to help you visualize your growth
                    and identify areas for improvement.
                  </p>
                  <Button className="mt-6" style={styles.accentButton}>
                    Get Notified
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      {/* Exercise detail modal */}
      <Dialog open={isExerciseModalOpen} onOpenChange={setIsExerciseModalOpen}>
  <DialogContent
    className="w-[90vw] max-w-[1200px] h-[80vh] overflow-hidden" // Set a max height and hide overflow
    style={{
      backgroundColor: 'black',
      borderColor: '#52b788',
      color: '#d8f3dc',
    }}
  >
    <DialogHeader>
      <DialogTitle className="text-center pb-6" style={styles.text}>
        {selectedExercise?.title}
      </DialogTitle>

      <DialogDescription
        className="text-center flex justify-center space-x-4"
        style={styles.subtext}
      >
        <span>{selectedExercise?.language}</span>
        <span>•</span>
        <span>{selectedExercise?.difficulty}</span>
        <span>•</span>
        <span>{selectedExercise?.date}</span>
      </DialogDescription>
    </DialogHeader>

    {/* Scrollable content */}
    <div className="space-y-6 py-4 overflow-y-auto h-[calc(100%-120px)]" style={{ maxHeight: 'calc(100% - 120px)' }}>
      <div className="bg-opacity-50 p-4 rounded-lg" style={{ backgroundColor: '#081c15' }}>
        <h4 className="text-lg font-medium mb-3" style={styles.accent}>
          Description
        </h4>
        <p style={styles.text}>{selectedExercise?.fullDescription}</p>
      </div>

      <Tabs defaultValue="problem">
        <TabsList className="w-full" style={{ backgroundColor: '#081c15' }}>
          <TabsTrigger value="problem" className="flex-1" style={{ color: '#d8f3dc' }}>
            Problem
          </TabsTrigger>
          <TabsTrigger value="solution" className="flex-1" style={{ color: '#d8f3dc' }}>
            Solution
          </TabsTrigger>
          <TabsTrigger value="hints" className="flex-1" style={{ color: '#d8f3dc' }}>
            Hints
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="problem"
          className="mt-4 p-4 rounded-lg"
          style={{ backgroundColor: '#081c15' }}
        >
          <div className="mb-4">
            <h5 className="text-sm font-medium mb-2" style={styles.subtext}>
              Instructions
            </h5>
            <p style={styles.text}>{selectedExercise?.fullDescription}</p>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-sm font-medium" style={styles.subtext}>
                Start Coding
              </h5>
              <Button variant="ghost" size="sm" style={styles.button}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Starter Code
              </Button>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a2e23' }}>
              <pre className="text-sm overflow-x-auto" style={styles.text}>
                {`// ${selectedExercise?.language} Solution
// Implement your code here

function solve() {
  // Your code here
}

// Test your solution
console.log(solve());`}
              </pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="solution"
          className="mt-4 p-4 rounded-lg space-y-6"
          style={{ backgroundColor: '#081c15' }}
        >
          {selectedExercise?.solution?.code ? (
            <div className="space-y-5">
              <div className="mb-4">
                <h5 className="text-base font-medium mb-3" style={styles.accent}>
                  Solution Explanation
                </h5>
                <p className="mb-4" style={styles.text}>
                  This solution demonstrates an efficient approach to the problem, focusing on optimizing both time and space complexity.
                </p>
              </div>

              <div className="mb-2">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-base font-medium" style={styles.accent}>
                    Solution Code
                  </h5>
                  <Button
                    variant="outline"
                    size="sm"
                    style={styles.button}
                    className="flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Solution
                  </Button>
                </div>
                <div
                  className="p-5 rounded-lg"
                  style={{
                    backgroundColor: '#0a2e23',
                    border: '1px solid rgba(82, 183, 136, 0.3)',
                  }}
                >
                  <pre className="text-sm overflow-x-auto py-2" style={styles.text}>
                    {selectedExercise?.solution?.code}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 my-4">
              <Lightbulb
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: '#52b788', opacity: 0.7 }}
              />
              <h5 className="font-medium text-lg mb-3" style={styles.text}>
                Solution Not Available
              </h5>
              <p className="max-w-md mx-auto" style={styles.subtext}>
                Try solving this problem first, then check back for the solution.
              </p>
              <Button variant="outline" className="mt-4" style={styles.button}>
                Request Solution
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="hints"
          className="mt-4 p-4 rounded-lg"
          style={{ backgroundColor: '#081c15' }}
        >
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium mb-2 flex items-center" style={styles.subtext}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Hint 1
              </h5>
              <p style={styles.text}>Think about edge cases first.</p>
            </div>
            <div>
              <h5 className="text-sm font-medium mb-2 flex items-center" style={styles.subtext}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Hint 2
              </h5>
              <p style={styles.text}>Consider using a helper function to simplify the solution.</p>
            </div>
            <div>
              <h5 className="text-sm font-medium mb-2 flex items-center" style={styles.subtext}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Hint 3
              </h5>
              <p style={styles.text}>Remember to optimize for time complexity.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <DialogFooter className="flex justify-between items-center">
      <Button variant="outline" style={styles.button}>
        <CheckCircle className="h-4 w-4 mr-2" />
        Mark As Complete
      </Button>
      <Button style={styles.accentButton}>Submit Solution</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}