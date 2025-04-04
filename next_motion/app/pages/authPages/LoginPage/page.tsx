"use client";
import React from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function WavyBackgroundDemo() {
  return (
    <WavyBackground className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col items-center">
        <p className="text-2xl md:text-4xl lg:text-6xl text-white font-bold inter-var text-center mb-2">
          LearnWith Debugging
        </p>
        <p className="text-base md:text-xl text-white/80 font-normal inter-var text-center mb-8">
          Master the art of debugging with real-time analysis
        </p>
        
        <Card className="w-full max-w-[500px] bg-white text-black shadow-lg rounded-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-center text-black">Welcome Back, Developer</CardTitle>
            <CardDescription className="text-center text-gray-600 text-lg">
              Continue your debugging journey where you left off
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-black font-medium">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="developer@example.com" 
                    className="border-gray-300 rounded-lg py-6" 
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-black font-medium">Password</Label>
                    <Link href="#" className="text-sm text-black hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    className="border-gray-300 rounded-lg py-6" 
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-black hover:bg-[#90e0ef] hover:text-black text-white  py-6 rounded-lg text-lg font-medium duration-200">
              Sign In
            </Button>
            <div className="text-center w-full">
              <span className="text-gray-600">New to LearnWith Debugging? </span>
              <Link href="/pages/authPages/RegisterPage" className="text-black hover:underline font-medium">
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <p className="text-base md:text-lg mt-6 text-white font-normal inter-var text-center">
          Debug smarter, not harder with our AI-powered tools
        </p>
      </div>
    </WavyBackground>
  );
}