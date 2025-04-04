"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  developerType: string;
  experienceLevel: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    developerType: "",
    experienceLevel: ""
  });
    const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        const { username, email, password, confirmPassword, developerType, experienceLevel } = formData;
        
        // Validation
        if (!username || !email || !password || !confirmPassword || !developerType || !experienceLevel) {
            toast.error("Please fill in all fields!");
            return;
        }
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        const response = await axios.post(
            "http://localhost:3001/api/auth/register",
            {
                username,
                email,
                password,
                developerType,
                experienceLevel
            },
            {
                withCredentials: true, // For cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Check for 201 (not 200)
        if (response.status === 201) {
            toast.success("Registration successful! You can now log in.");
            setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
                developerType: "",
                experienceLevel: ""
            });
            router.push("/pages/authPages/LoginPage");
        }
        
    } catch (err: any) {
        // Improved error handling
        if (err.response) {
            // Server responded with error status
            if (err.response.status === 400) {
                toast.error(err.response.data.message || "Registration failed");
            } else {
                toast.error(`Server error: ${err.response.status}`);
            }
        } else if (err.request) {
            // Request was made but no response
            toast.error("No response from server");
        } else {
            // Other errors
            toast.error("An error occurred. Please try again later.");
        }
        console.error("Registration error:", err);
    }
};

  return (
    <WavyBackground className="max-w-4xl mx-auto pb-10 ">
      <div className="flex flex-col items-center">
        <p className="text-2xl md:text-4xl lg:text-6xl text-white font-bold inter-var text-center mb-2">
          LearnWith Debugging
        </p>
        <p className="text-base md:text-xl text-white/80 font-normal inter-var text-center mb-8">
          Join our community of developers mastering debugging
        </p>
        
        <Card className="w-full max-w-3xl bg-white text-black shadow-lg rounded-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-center text-black">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600 text-lg">
              Start your debugging journey today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - User Information */}
                <div className="flex-1 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-black font-medium">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="devninja"
                      className="border-gray-300 rounded-lg py-6"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-black font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="developer@example.com"
                      className="border-gray-300 rounded-lg py-6"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-black font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="border-gray-300 rounded-lg py-6"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="text-black font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="border-gray-300 rounded-lg py-6"
                      required
                    />
                  </div>
                </div>
                
                {/* Right Column - Developer Profile */}
                <div className="flex-1 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="developerType" className="text-black font-medium">Developer Type</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("developerType", value)}
                      value={formData.developerType}
                    >
                      <SelectTrigger className="border-gray-300 rounded-lg py-6">
                        <SelectValue placeholder="Select your developer type" />
                      </SelectTrigger>
                      <SelectContent className="bg-black text-white">
                        <SelectItem value="full-stack" className="hover:bg-green-300 hover:text-black">Full Stack</SelectItem>
                        <SelectItem value="front-end" className="hover:bg-green-300 hover:text-black">Front End</SelectItem>
                        <SelectItem value="back-end" className="hover:bg-green-300 hover:text-black">Back End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="experienceLevel" className="text-black font-medium">Experience Level</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("experienceLevel", value)}
                      value={formData.experienceLevel}
                    >
                      <SelectTrigger className="border-gray-300 rounded-lg py-6">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent className="bg-black text-white">
                        <SelectItem value="beginner" className="hover:bg-green-300 hover:text-black">Beginner</SelectItem>
                        <SelectItem value="intermediate" className="hover:bg-green-300 hover:text-black">Intermediate</SelectItem>
                        <SelectItem value="advanced" className="hover:bg-green-300 hover:text-black">Advanced</SelectItem>
                        <SelectItem value="professional" className="hover:bg-green-300 hover:text-black">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Adding some extra space to balance columns visually */}
                  <div className="pt-8">
                    <p className="text-gray-600 text-sm">
                      Your developer profile helps us customize your debugging experience
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  type="submit" 
                  className="w-full bg-black hover:bg-[#90e0ef] hover:text-black text-white py-6 rounded-lg text-lg font-medium duration-200"
                >
                  Register
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/pages/authPages/LoginPage" className="text-black hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <p className="text-base md:text-lg mt-6 text-white font-normal inter-var text-center">
          Join thousands of developers improving their debugging skills
        </p>
      </div>
    </WavyBackground>
  );
}