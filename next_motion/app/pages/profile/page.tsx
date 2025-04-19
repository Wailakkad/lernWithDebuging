// app/dashboard/page.tsx
"use client";
import React , { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
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
import { response } from 'express';

// Types
interface ApiUser {
  _id: string;
  username: string;
  email: string;
  profileImage : string;
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
interface Course {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: string;
}


const API_BASE_URL = 'http://localhost:3001/api/actions';

export default function DeveloperDashboard() {
  useProtectedRoute();
  const {logout} = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [debuggingSolutions, setDebuggingSolutions] = useState<DebuggingSolution[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
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
        avatarUrl:  data.user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.username)}&background=random&color=fff`,
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
  const fetchCourses = async () => {
    try {
      const { data } = await axios.get<{
        message: string;
        courses: Array<{
          _id: string;
          userId: string;
          language: string;
          courses: Array<{
            title: string;
            content: string;
            _id: string;
          }>;
        }>;
      }>(`${API_BASE_URL}/getCourses`, { withCredentials: true });
  
      if (data.courses) {
        // Transform the API response to match your frontend interface
        const transformedCourses = data.courses.flatMap((courseGroup) =>
          courseGroup.courses.map((course) => ({
            id: course._id,
            title: course.title,
            content: course.content,
            language: courseGroup.language,
            createdAt: courseGroup._id, // Assuming `_id` is used as a unique identifier
          }))
        );
  
        setCourses(transformedCourses);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading courses");
      console.error(err);
    }
  };
  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      // Make a DELETE request to the backend API
      const response = await axios.delete(`${API_BASE_URL}/deleteExercise/${exerciseId}`, {
        withCredentials: true, // Include credentials for authentication
      });
  
      if (response.status === 200) {
        // Remove the deleted exercise from the state
        setExercises((prevExercises) =>
          prevExercises.filter((exercise) => exercise.id !== exerciseId)
        );
        toast.success('Exercise deleted successfully');
      } else {
        toast.error('Failed to delete exercise:', response.data.message);
      }
    } catch (err) {
      console.error('Error deleting exercise:', err);
      
    }
  };
  const HandleMarkedStatus = async (exerciseId: string) => {
    try {
      // Make a POST request to the backend API
      const response = await axios.post(
        `${API_BASE_URL}/MarkStatusExercice/${exerciseId}`,
        { Newstatus: "complete" }, // Pass the new status in the request body
        { withCredentials: true } // Include credentials for authentication
      );
  
      if (response.status === 200) {
        // Update the exercises state to reflect the new status
        setExercises((prevExercises) =>
          prevExercises.map((exercise) =>
            exercise.id === exerciseId
              ? { ...exercise, status: "complete" } // Update the status of the matched exercise
              : exercise
          )
        );
        toast.success("Exercise marked as complete!");
      } else {
        toast.error("Failed to mark exercise as complete.");
      }
    } catch (err) {
      console.error("Error marking exercise as complete:", err);
      toast.error("An error occurred while updating the status.");
    }
  };
  const HandleDeleteSubmition = async (submitionId: string) => {
    if (!submitionId) {
      toast.error("The submission ID is required.");
      return;
    }
  
    try {
      // Make a DELETE request to the backend API
      const response = await axios.delete(`${API_BASE_URL}/deleteSubmission/${submitionId}`, {
        withCredentials: true, // Include credentials for authentication
      });
  
      if (response.status === 200) {
        // Remove the deleted submission from the state
        setDebuggingSolutions((prevSubmitions) =>
          prevSubmitions.filter((submission) => submission._id !== submitionId)
        );
        toast.success("Submission deleted successfully.");
      } else {
        toast.error("Failed to delete submission.");
      }
    } catch (err) {
      console.error("Error deleting submission:", err);
      toast.error("An error occurred while deleting the submission.");
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
          fetchExercises(),
          fetchCourses()
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
              { name: "courses", icon: BookOpen, label: "Courses" },
              
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
      {user.avatarUrl ? (
        <>
          <AvatarImage 
            src={user.avatarUrl} 
            alt={user.name} 
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`;
            }}
          />
          <AvatarFallback style={{ backgroundColor: 'rgba(204, 255, 51, 0.2)', color: '#ccff33' }}>
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </>
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(204, 255, 51, 0.2)',
          color: '#ccff33',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
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
            <Link href="/pages/editPage">
            <Button variant="outline" style={styles.button} className="hover:border-opacity-80">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            </Link>
            
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
          delta: "+3 this week",
        },
        {
          title: "Completed Exercises",
          value: exercises.filter((ex) => ex.status === "Completed").length,
          delta: "+5 this week",
        },
        {
          title: "Favorite Language",
          value: "TypeScript",
          delta: "23 sessions",
        },
      ].map((stat, idx) => (
        <Card key={idx} style={styles.card}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal" style={styles.subtext}>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold" style={styles.text}>
                {stat.value}
              </span>
              <span style={styles.accent} className="text-sm">
                {stat.delta}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Skills & Languages */}
    <Card style={styles.card}>
      <CardHeader>
        <CardTitle style={styles.text}>Programming Languages</CardTitle>
        <CardDescription style={styles.subtext}>
          Your skills and proficiency levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.languages.map((lang, index) => {
            const isAdvanced = lang.level === "Advanced";
            const proficiencyWidth =
              lang.level === "Advanced"
                ? "90%"
                : lang.level === "Intermediate"
                ? "60%"
                : "30%";

            return (
              <div
                key={index}
                className="rounded-lg p-4 flex flex-col"
                style={styles.darkBg}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium" style={styles.text}>
                    {lang.name}
                  </span>
                  <Badge
                    style={{
                      backgroundColor: isAdvanced
                        ? "rgba(204, 255, 51, 0.2)"
                        : "rgba(82, 183, 136, 0.2)",
                      color: isAdvanced ? "#ccff33" : "#52b788",
                      borderColor: isAdvanced
                        ? "rgba(204, 255, 51, 0.3)"
                        : "rgba(82, 183, 136, 0.3)",
                    }}
                  >
                    {lang.level}
                  </Badge>
                </div>

                <div
                  className="mt-4 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#0a2e23" }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: proficiencyWidth,
                      backgroundColor: "#ccff33",
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
      {/* Recent Debugging */}
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
            {debuggingSolutions.length === 0 ? (
              <div className="text-center py-8">
                <FileCode
                  className="h-12 w-12 mx-auto mb-4"
                  style={{ color: "#52b788" }}
                />
                <h4 className="text-lg font-medium" style={styles.text}>
                  No debugging solutions saved
                </h4>
                <p style={{ color: "#a7c6bc" }}>
                  You haven't saved any debugging solutions yet. Start debugging
                  to see them here!
                </p>
              </div>
            ) : (
              debuggingSolutions.slice(0, 2).map((solution) => (
                <div
                  key={solution._id}
                  className="flex flex-col space-y-4 p-4 rounded-lg transition-colors"
                  style={styles.darkBg}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="p-3 rounded-full"
                      style={{
                        backgroundColor: "rgba(204, 255, 51, 0.15)",
                      }}
                    >
                      <FileCode
                        className="h-6 w-6"
                        style={styles.accent}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className="font-medium text-lg"
                          style={styles.text}
                        >
                          {solution.errorType}
                        </h4>
                      </div>
                      <div
                        className="flex items-center space-x-2 text-sm mt-1"
                        style={styles.subtext}
                      >
                        <span>{solution.language}</span>
                        <span>•</span>
                        <span>
                          {new Date(
                            solution.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      style={styles.button}
                    >
                      View Details
                    </Button>
                  </div>

                  <div
                    className="bg-opacity-50 p-4 rounded-lg"
                    style={{ backgroundColor: "#0a2e23" }}
                  >
                    <h5
                      className="text-sm font-medium mb-2"
                      style={styles.subtext}
                    >
                      Error Analysis
                    </h5>
                    <p
                      className="text-sm mb-2"
                      style={styles.text}
                    >
                      {solution.errorAnalysis.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      {/* Recent Exercises */}
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
      {exercises.length === 0 ? (
        <div className="text-center py-8">
          <Dumbbell
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: "#52b788" }}
          />
          <h4 className="text-lg font-medium" style={styles.text}>
            No exercises saved
          </h4>
          <p style={{ color: "#a7c6bc" }}>
            You haven't saved any exercises yet. Start practicing to see them here!
          </p>
        </div>
      ) : (
        exercises.slice(0, 2).map((exercise, index) => (
          <div
            key={index}
            className="flex flex-col space-y-4 p-4 rounded-lg transition-colors"
            style={styles.darkBg}
          >
            <div className="flex items-center space-x-4">
              <div
                className="p-3 rounded-full"
                style={{
                  backgroundColor: "rgba(204, 255, 51, 0.15)",
                }}
              >
                <Dumbbell className="h-6 w-6" style={styles.accent} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className="font-medium text-lg"
                    style={styles.text}
                  >
                    {exercise.title}
                  </h4>
                </div>
                <div
                  className="flex items-center space-x-2 text-sm mt-1"
                  style={styles.subtext}
                >
                  <span>{exercise.language}</span>
                  <span>•</span>
                  <span>{exercise.difficulty}</span>
                  <span>•</span>
                  <span>{exercise.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </CardContent>
</Card>

     
     {/* Recent Courses */}
<Card style={styles.card}>
  <CardHeader>
    <div className="flex justify-between items-center">
      <CardTitle style={styles.text}>Recent Courses</CardTitle>
      <Button
        variant="link"
        className="p-0"
        style={styles.accent}
        onClick={() => setActiveTab("courses")}
      >
        View All
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {courses.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: "#52b788" }}
          />
          <h4 className="text-lg font-medium" style={styles.text}>
            No courses saved
          </h4>
          <p style={{ color: "#a7c6bc" }}>
            You haven't saved any courses yet. Start learning to see them here!
          </p>
        </div>
      ) : (
        courses.slice(0, 2).map((course, index) => (
          <div
            key={index}
            className="flex flex-col space-y-4 p-4 rounded-lg transition-colors"
            style={styles.darkBg}
          >
            <div className="flex items-center space-x-4">
              <div
                className="p-3 rounded-full"
                style={{
                  backgroundColor: "rgba(204, 255, 51, 0.15)",
                }}
              >
                <BookOpen className="h-6 w-6" style={styles.accent} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className="font-medium text-lg"
                    style={styles.text}
                  >
                    {course.title}
                  </h4>
                </div>
                <div
                  className="flex items-center space-x-2 text-sm mt-1"
                  style={styles.subtext}
                >
                  <span>{course.language}</span>
                  <span>•</span>
                  <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "#081c15" }}>
              <h5 className="text-sm font-medium mb-2" style={styles.subtext}>
                Content
              </h5>
              <p
                className="text-sm"
                style={styles.text}
                dangerouslySetInnerHTML={{
                  __html: course.content.length > 200
                    ? `${course.content.substring(0, 200)}...`
                    : course.content,
                }}
              ></p>
            </div>
          </div>
        ))
      )}
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
                        <Button onClick={() => HandleDeleteSubmition(solution._id)} variant="outline" size="sm" style={styles.button}>
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
                    { id: "complete", label: "Completed", icon: CheckCircle2 },
                    { id: "in progress", label: "In Progress", icon: Clock }
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
                          <button onClick={()=> handleDeleteExercise(exercise.id)}  className='bg-red-500 text-white font-bold px-4 py-2 rounded-2xl'>
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
   {activeTab === "courses" && (
  <Card className="border-0 shadow-lg" style={{ backgroundColor: '#0a2e22', color: '#d8f3dc' }}>
    <CardHeader>
      <CardTitle style={styles.text}>Courses</CardTitle>
      <CardDescription style={styles.subtext}>
        Explore your saved learning modules
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4" style={{ color: '#52b788' }} />
            <h4 className="text-lg font-medium" style={styles.text}>
              No courses found
            </h4>
            <p style={{ color: '#a7c6bc' }}>
              Start saving courses to see them here!
            </p>
          </div>
        ) : (
          courses.map((course, index) => (
            <div
              key={course.id}
              className="p-6 rounded-lg transition-colors"
              style={{ backgroundColor: 'black' }}
            >
              {/* Course Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className="p-3 rounded-full"
                  style={{
                    backgroundColor: 'rgba(204, 255, 51, 0.15)',
                  }}
                >
                  <BookOpen className="h-6 w-6" style={styles.accent} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-lg" style={styles.text}>
                    {course.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm mt-1" style={styles.subtext}>
                    <span>{course.language}</span>
                    <span>•</span>
                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Badge similar to image */}
                <div className="ml-auto mr-2">
                  <span className="px-3 py-1 text-xs rounded-full font-medium" 
                        style={{ backgroundColor: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8' }}>
                    Learning Module {index + 1}
                  </span>
                </div>
                
                <button className='px-3 py-2 rounded-2xl font-bold bg-red-600 text-white'>Delete</button>
              </div>
              
              {/* Course Content with Enhanced Educational Styling */}
              <div className="mt-4 rounded-lg overflow-hidden border border-gray-700">
                {renderCourseContent(course.content)}
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
        onClick={() => toast.info('Feature to add new courses coming soon!')}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Add New Course
      </Button>
    </CardFooter>
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

       
      </Tabs>
    </div>

    <DialogFooter className="flex justify-between items-center">
    <Button
  onClick={() => {
    if (selectedExercise?.id) {
      HandleMarkedStatus(selectedExercise.id); // Only call the function if id is defined
    } else {
      console.error("Exercise ID is undefined");
    }
  }}
  variant="outline"
  style={styles.accentButton}
>
  <CheckCircle className="h-4 w-4 mr-2" />
  Mark As Complete
</Button>
     
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}

const sanitizeContent = (content: string): string => {
  return content
    .replace(/\*\*/g, '') // Remove double asterisks
    .replace(/`/g, '') // Remove backticks
    .replace(/\/{2,}/g, '') // Remove multiple slashes
    .replace(/\.\.+/g, '.') // Replace multiple dots with a single dot
    .trim(); // Remove leading and trailing whitespace
};

function renderCourseContent(content: string) {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 rounded-lg border border-gray-800">
        <BookOpen className="h-10 w-10 text-gray-500 mb-2" />
        <p className="text-gray-400 text-sm font-medium">No content available for this module</p>
      </div>
    );
  }
  
  const sanitizedContent = sanitizeContent(content);
  const sections = sanitizedContent.split('\n\n');
  
  // Track important content markers
  let hasTitle = false;
  let currentSection = "intro";
  
  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900/30">
      {/* Course content header with navigation dots */}
      <div className="flex items-center px-4 py-2 bg-gray-800/80 border-b border-gray-700">
        <div className="flex space-x-1.5 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="h-5 w-px bg-gray-700 mx-2"></div>
        <div className="text-xs font-medium text-gray-400">
          {sections.length} sections
        </div>
      </div>
      
      {/* Course content body */}
      <div className="divide-y divide-gray-800/70">
        {sections.map((section, sectionIndex) => {
          // Identify section type
          const isTitle = sectionIndex === 0 && !section.startsWith('```') && section.length < 100;
          const isHeading = !isTitle && (section.startsWith('# ') || section.startsWith('## ') || section.startsWith('### '));
          const isPracticalExample = section.toLowerCase().includes('practical example') || 
                                    section.toLowerCase().includes('example:');
          const isCode = section.trim().startsWith('```') && section.trim().endsWith('```');
          
          // Update current section tracker for styling context
          if (isHeading || isPracticalExample) {
            if (section.toLowerCase().includes('example')) {
              currentSection = "example";
            } else if (section.toLowerCase().includes('practice')) {
              currentSection = "practice";
            } else if (section.toLowerCase().includes('summary') || section.toLowerCase().includes('conclusion')) {
              currentSection = "summary";
            }
          }
          
          // Title section
          if (isTitle && !hasTitle) {
            hasTitle = true;
            return (
              <div key={sectionIndex} className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40">
                <div className="px-5 py-4 border-l-4 border-blue-500">
                  <h2 className="text-xl font-bold text-blue-300">{section}</h2>
                </div>
              </div>
            );
          }
          
          // Heading sections
          if (isHeading) {
            const headingText = section.replace(/^#+\s+/, '');
            const headingLevel = section.match(/^#+/)?.[0].length || 1;
            
            let headingColor = "text-emerald-400";
            let borderColor = "border-emerald-500/70";
            let bgColor = "from-emerald-900/30 to-emerald-900/10";
            
            // Adjust styling based on section context
            if (currentSection === "example") {
              headingColor = "text-amber-400";
              borderColor = "border-amber-500/70";
              bgColor = "from-amber-900/30 to-amber-900/10";
            } else if (currentSection === "practice") {
              headingColor = "text-purple-400";
              borderColor = "border-purple-500/70";
              bgColor = "from-purple-900/30 to-purple-900/10";
            } else if (currentSection === "summary") {
              headingColor = "text-blue-400";
              borderColor = "border-blue-500/70";
              bgColor = "from-blue-900/30 to-blue-900/10";
            }
            
            return (
              <div key={sectionIndex} className={`bg-gradient-to-r ${bgColor}`}>
                <div className={`px-5 py-3 border-l-4 ${borderColor}`}>
                  <h3 className={`${headingLevel === 1 ? 'text-lg' : 'text-base'} font-semibold ${headingColor}`}>
                    {headingText}
                  </h3>
                </div>
              </div>
            );
          }
          
          // Practical example sections
          if (isPracticalExample) {
            return (
              <div key={sectionIndex} className="bg-gradient-to-r from-amber-900/30 to-amber-900/10">
                <div className="px-5 py-3 border-l-4 border-amber-500/70 flex items-center">
                  <span className="p-1 rounded-md bg-amber-500/20 mr-2">
                    <CodeIcon className="h-4 w-4 text-amber-400" />
                  </span>
                  <h4 className="text-md font-semibold text-amber-400">{section}</h4>
                </div>
              </div>
            );
          }
          
          // Code blocks
          if (isCode) {
            // Extract language and content
            const languageMatch = section.trim().match(/^```(\w+)/);
            const codeLanguage = languageMatch ? languageMatch[1] : '';
            const content = section.replace(/```(\w+)?|```/g, '').trim();
            const lines = content.split('\n');
            
            // Language-specific styling
            let languageColor = "text-blue-300";
            let languageBg = "bg-blue-500/20";
            
            if (codeLanguage === "javascript" || codeLanguage === "js") {
              languageColor = "text-yellow-300";
              languageBg = "bg-yellow-500/20";
            } else if (codeLanguage === "typescript" || codeLanguage === "ts") {
              languageColor = "text-blue-300";
              languageBg = "bg-blue-500/20";
            } else if (codeLanguage === "python" || codeLanguage === "py") {
              languageColor = "text-green-300";
              languageBg = "bg-green-500/20";
            } else if (codeLanguage === "html") {
              languageColor = "text-orange-300";
              languageBg = "bg-orange-500/20";
            } else if (codeLanguage === "css") {
              languageColor = "text-purple-300";
              languageBg = "bg-purple-500/20";
            }
            
            return (
              <div key={sectionIndex} className="bg-gray-900 border-y border-gray-800">
                {/* Code header */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80">
                  <div className="flex items-center">
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    
                    {codeLanguage && (
                      <>
                        <div className="h-4 w-px bg-gray-700 mx-3"></div>
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${languageColor} ${languageBg}`}>
                          {codeLanguage}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{lines.length} lines</span>
                    <div className="h-4 w-px bg-gray-700 mx-1"></div>
                    <button className="text-gray-400 hover:text-gray-300">
                      <ClipboardIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Code content */}
                <div className="flex">
                  {/* Line numbers */}
                  <div className="py-2 text-right px-2 select-none bg-gray-800/40 w-12">
                    {lines.map((_, i) => (
                      <div key={i} className="text-xs font-mono text-gray-500 leading-relaxed px-2">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  
                  {/* Code with syntax highlighting */}
                  <div className="py-2 pl-4 pr-6 overflow-x-auto w-full">
                    <code className="font-mono text-sm text-gray-200">
                      {lines.map((line, i) => (
                        <div key={i} className="leading-relaxed">
                          {/* Enhanced syntax highlighting patterns */}
                          {line
                            // Keywords
                            .replace(/\b(interface|class|constructor|extends|implements|public|private|protected|static|async|await|import|export|from|as|default|type)\b/g, 
                              match => `<span class="text-pink-400">${match}</span>`)
                            // Flow control
                            .replace(/\b(if|else|for|while|do|switch|case|break|continue|return|yield|throw|try|catch|finally|in|of)\b/g, 
                              match => `<span class="text-blue-400">${match}</span>`)
                            // Variable declarations
                            .replace(/\b(const|let|var|function)\b/g, 
                              match => `<span class="text-violet-400">${match}</span>`)
                            // Types
                            .replace(/\b(string|number|boolean|any|void|null|undefined|never|object|symbol|bigint|unknown|this)\b/g, 
                              match => `<span class="text-green-400">${match}</span>`)
                            // String literals
                            .replace(/(".*?"|'.*?'|`.*?`)/g, 
                              match => `<span class="text-amber-300">${match}</span>`)
                            // Numbers
                            .replace(/\b(\d+\.?\d*)\b/g, 
                              match => `<span class="text-orange-400">${match}</span>`)
                            // Boolean & null literals
                            .replace(/\b(true|false|null|undefined)\b/g, 
                              match => `<span class="text-purple-400">${match}</span>`)
                            // Custom types (capitalized words)
                            .replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, 
                              match => `<span class="text-teal-300">${match}</span>`)
                            // Methods & properties
                            .replace(/(\.\s*[a-zA-Z_][a-zA-Z0-9_]*)/g, 
                              match => `<span class="text-blue-300">${match}</span>`)
                            // Comments
                            .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/g, 
                              match => `<span class="text-gray-500 italic">${match}</span>`)
                          }
                        </div>
                      ))}
                    </code>
                  </div>
                </div>
              </div>
            );
          }
          
          // Regular paragraphs
          return (
            <div key={sectionIndex} className="px-5 py-3 bg-gray-900/50">
              <p className="text-sm leading-relaxed text-gray-300">
                {section.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {/* Process inline code in text */}
                    {line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-800 text-xs font-mono text-gray-200">$1</code>')}
                    {lineIndex < section.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { Code as LucideCodeIcon } from 'lucide-react';// Assumed component for the CodeIcon
const ClipboardIconArrow = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg> 
);

// Assumed component for the ClipboardIcon
const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);