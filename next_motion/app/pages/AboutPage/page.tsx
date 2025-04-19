'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
 
export default function SplineSceneBasic() {
  return (
    <div className="flex flex-col items-center bg-black px-12">
        
      <Card className="w-full h-screen bg-black/[0.96] relative overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
        />
        
        <div className="flex h-full">
          {/* Left content */}
          <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              AI-Powered Debugging Tutor
            </h1>
            <p className="mt-4 text-neutral-300 max-w-lg">
              Transform coding errors into learning opportunities. Our AI analyzes your code, 
              explains mistakes, and generates personalized exercises to strengthen your skills.
            </p>
          </div>

          {/* Right content */}
          <div className="flex-1 relative">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* New bottom section */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="bg-blue-900/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-300">Error Analysis</p>
                <p className="text-white font-medium">Powered by Qwen-Coder-25</p>
              </div>
              <div className="bg-purple-900/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-purple-300">Exercises & Lessons</p>
                <p className="text-white font-medium">Powered by Compound-Beta-Mini</p>
              </div>
            </div>
            <button className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
              Try Debugger
            </button>
          </div>
        </div>
      </Card>
      
     
    </div>
  )
}