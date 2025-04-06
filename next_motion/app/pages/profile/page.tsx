// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
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
  BookOpen
} from 'lucide-react';
import axios from 'axios';

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

interface DebuggingSolution {
  id: string;
  language: string;
  title: string;
  date: string;
  status: string;
}

interface Exercise {
  id: string;
  language: string;
  title: string;
  difficulty: string;
  status: string;
  date: string;
}

export default function DeveloperDashboard() {
  const router = useRouter();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [debuggingSolutions, setDebuggingSolutions] = useState<DebuggingSolution[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/actions/getUser' , { withCredentials: true });
        if (response.status !== 200) {
          throw new Error('Failed to fetch user data');
        }
        setUser(response.data);
        console.log('User data:', response.data);
      } catch (err) {
        setError('Error loading user profile');
        console.error(err);
      }
    };
    
    const fetchDebuggingSolutions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/actions/getSubmissions' , { withCredentials: true });
        if (response.status !== 200) {
          throw new Error('Failed to fetch debugging solutions');
        }
        setDebuggingSolutions(response.data.submissions);
        console.log('Debugging solutions:', response.data);
      } catch (err) {
        setError('Error loading debugging solutions');
        console.error(err);
      }
    };
    
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Failed to fetch exercises');
        }
        const data = await response.json();
        setExercises(data);
      } catch (err) {
        setError('Error loading exercises');
        console.error(err);
      }
    };
    
    const loadAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchDebuggingSolutions(),
        fetchExercises()
      ]);
      setIsLoading(false);
    };
    
    loadAllData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <Card className="w-96 bg-gray-900/70 border-gray-800">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{error || "Failed to load dashboard data"}</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-100 flex flex-col border-r border-gray-800">
        <div className="p-4 flex items-center space-x-2 border-b border-gray-800">
          <Code2 className="h-6 w-6 text-green-400" />
          <h1 className="text-lg font-semibold text-green-400">DevDebugger</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setActiveTab("overview")}
            >
              <Home className="h-5 w-5 mr-3 text-gray-400" />
              Overview
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setActiveTab("debugging")}
            >
              <Terminal className="h-5 w-5 mr-3 text-gray-400" />
              Debugging Solutions
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setActiveTab("exercises")}
            >
              <Dumbbell className="h-5 w-5 mr-3 text-gray-400" />
              Exercises
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <BarChart3 className="h-5 w-5 mr-3 text-gray-400" />
              Progress
            </Button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Settings className="h-5 w-5 mr-3 text-gray-400" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-400" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-950 to-gray-900">
        {/* Top header with user info */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/70 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-green-500/30">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-green-900/30 text-green-400">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{user.role}</span>
                <span>•</span>
                <span>Member since {user.joinDate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Terminal className="h-4 w-4 mr-2" />
              New Debug Session
            </Button>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats cards */}
                <Card className="bg-gray-900/70 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-gray-400 text-sm font-normal">Debug Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-white">{user.debugCount}</span>
                      <span className="text-green-400 text-sm">+3 this week</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/70 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-gray-400 text-sm font-normal">Completed Exercises</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-white">{user.exerciseCount}</span>
                      <span className="text-green-400 text-sm">+5 this week</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/70 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-gray-400 text-sm font-normal">Favorite Language</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-white">TypeScript</span>
                      <span className="text-green-400 text-sm">23 sessions</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Skills & Languages */}
              <Card className="bg-gray-900/70 border-gray-800">
                <CardHeader>
                  <CardTitle>Programming Languages</CardTitle>
                  <CardDescription>Your skills and proficiency levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {user.languages.map((lang, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4 flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white">{lang.name}</span>
                          <Badge className={
                            lang.level === "Advanced" 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : lang.level === "Intermediate"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }>
                            {lang.level}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ 
                              width: 
                                lang.level === "Advanced" ? "90%" 
                                : lang.level === "Intermediate" ? "60%" 
                                : "30%" 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-900/70 border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Debugging</CardTitle>
                      <Button 
                        variant="link" 
                        className="text-green-400 p-0"
                        onClick={() => setActiveTab("debugging")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {debuggingSolutions.slice(0, 3).map((solution) => (
                        <div key={solution.id} className="flex items-center space-x-4 bg-gray-800/50 p-3 rounded-lg">
                          <div className="bg-gray-800 p-2 rounded-full">
                            <FileCode className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-white">{solution.title}</h4>
                              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                                {solution.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                              <span>{solution.language}</span>
                              <span>•</span>
                              <span>{solution.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/70 border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Exercises</CardTitle>
                      <Button 
                        variant="link" 
                        className="text-green-400 p-0"
                        onClick={() => setActiveTab("exercises")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {exercises.slice(0, 3).map((exercise) => (
                        <div key={exercise.id} className="flex items-center space-x-4 bg-gray-800/50 p-3 rounded-lg">
                          <div className="bg-gray-800 p-2 rounded-full">
                            <Dumbbell className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-white">{exercise.title}</h4>
                              <Badge variant="outline" className={
                                exercise.status === "Completed" 
                                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              }>
                                {exercise.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
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
            <Card className="bg-gray-900/70 border-gray-800">
              <CardHeader>
                <CardTitle>Debugging Solutions</CardTitle>
                <CardDescription>Your history of fixed code issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debuggingSolutions.map((solution) => (
                    <div key={solution.id} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className="bg-gray-800 p-3 rounded-full">
                        <FileCode className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white text-lg">{solution.title}</h4>
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                            {solution.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                          <span>{solution.language}</span>
                          <span>•</span>
                          <span>{solution.date}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800 flex justify-center py-4">
                <Button 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debugging-solutions?page=2');
                      if (!response.ok) throw new Error('Failed to load more');
                      const moreData = await response.json();
                      setDebuggingSolutions([...debuggingSolutions, ...moreData]);
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
            <Card className="bg-gray-900/70 border-gray-800">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Practice Exercises</CardTitle>
                    <CardDescription>Your learning exercises collection</CardDescription>
                  </div>
                  <Tabs defaultValue="all" className="w-[400px]">
                    <TabsList className="bg-gray-800">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                      <TabsTrigger value="inprogress">In Progress</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className={`p-3 rounded-full ${exercise.status === "Completed" ? "bg-green-900/20" : "bg-blue-900/20"}`}>
                        {exercise.status === "Completed" ? (
                          <CheckCircle2 className="h-6 w-6 text-green-400" />
                        ) : (
                          <Clock className="h-6 w-6 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white text-lg">{exercise.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={
                              exercise.difficulty === "Advanced" 
                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                : exercise.difficulty === "Intermediate"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                : "bg-green-500/10 text-green-400 border-green-500/30"
                            }>
                              {exercise.difficulty}
                            </Badge>
                            <Badge variant="outline" className={
                              exercise.status === "Completed" 
                                ? "bg-green-500/10 text-green-400 border-green-500/30"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            }>
                              {exercise.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                          <span>{exercise.language}</span>
                          <span>•</span>
                          <span>{exercise.date}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600">
                          <BookOpen className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {exercise.status !== "Completed" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <Dumbbell className="h-4 w-4 mr-2" />
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800 flex justify-center py-4">
                <Button 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/exercises?page=2');
                      if (!response.ok) throw new Error('Failed to load more');
                      const moreData = await response.json();
                      setExercises([...exercises, ...moreData]);
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
        </div>
      </main>
    </div>
  );
}