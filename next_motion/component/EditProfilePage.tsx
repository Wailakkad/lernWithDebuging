"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Upload, Camera } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DEVELOPMENT_TYPES = [
  "Front End",
  "Back End",
  "Full Stack",
  "Mobile",
  "DevOps",
  "Data Science",
  "UI/UX Design",
  "Game Development",
];

interface UserProfile {
  username: string;
  email: string;
  developmentType: string;
  experienceLevel: string;
  profileImage: string | null;
  thumbnailImage: string | null;
}

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle: angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

const EditProfilePage: React.FC = () => {
  const { user, fetchUser, loadingUser, userError } = useAuth();
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  const MINIMUM_BEAMS = 20;
  const intensity = "subtle"; // Use subtle intensity for the background

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Background animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const opacityMap = {
      subtle: 0.7,
      medium: 0.85,
      strong: 1,
    };

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      const totalBeams = MINIMUM_BEAMS * 1.5;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(canvas.width, canvas.height)
      );
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      if (!canvas) return beam;
      
      const column = index % 3;
      const spacing = canvas.width / 3;

      beam.y = canvas.height + 100;
      beam.x =
        column * spacing +
        spacing / 2 +
        (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = 190 + (index * 70) / totalBeams;
      beam.opacity = 0.2 + Math.random() * 0.1;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityMap[intensity as keyof typeof opacityMap];

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
      gradient.addColorStop(
        0.1,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(
        0.4,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`
      );
      gradient.addColorStop(
        0.6,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`
      );
      gradient.addColorStop(
        0.9,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(35px)";

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;

        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }

        drawBeam(ctx, beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData((prev) => ({ ...prev!, [name]: value }));
      setIsDirty(true);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => (prev ? { ...prev, profileImage: reader.result as string } : prev));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const firstLetter = formData?.username ? formData.username.charAt(0).toUpperCase() : "?";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
        console.log(formData)
      

      
    } catch (error) {
      setFormStatus({ type: "error", message: "Failed to update profile. Please try again." });
    } 
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen w-full overflow-hidden bg-neutral-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ filter: "blur(15px)" }}
        />
        <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen w-full overflow-hidden bg-neutral-950">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ filter: "blur(15px)" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 flex items-center justify-center h-screen">
          <div className="bg-white/90 backdrop-blur-md border border-red-200 text-red-700 p-6 rounded-xl shadow-lg">
            <p className="font-medium text-lg">{userError}</p>
            <button 
              onClick={fetchUser} 
              className="mt-4 text-sm bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-neutral-950">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ filter: "blur(15px)" }}
      />
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          backdropFilter: "blur(10px)",
        }}
      />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 min-h-screen">
        {/* Top navigation with back link */}
        <div className="mb-8 pt-4">
          <Link href="/pages/profile" className="inline-flex items-center text-green-400 hover:text-green-300 font-medium transition-colors group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
            Back to Dashboard
          </Link>
        </div>
          
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-white mb-6">Your Profile</h2>
              
              {/* Profile image */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative mb-4 group"
                >
                  <div 
                    onClick={() => profileInputRef.current?.click()} 
                    className="w-36 h-36 rounded-full overflow-hidden cursor-pointer border-2 border-white/20 transition-all group-hover:border-green-400 shadow-lg"
                  >
                    {formData?.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-800/50 to-blue-600/50 text-white font-bold text-6xl">
                        {firstLetter}
                      </div>
                    )}
                    
                    {/* Camera overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={profileInputRef}
                    onChange={handleProfileImageChange}
                    accept="image/png,image/jpeg"
                    className="hidden"
                  />
                </motion.div>
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="text-green-400 text-sm font-medium hover:text-green-300 flex items-center"
                >
                  <Upload className="h-4 w-4 mr-1" /> Upload new image
                </button>
              </div>
              
              {/* Profile info summary */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="text-sm">
                  <span className="text-gray-400 block">Username</span>
                  <span className="font-medium text-white">{formData?.username || "Not set"}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400 block">Specialty</span>
                  <span className="font-medium text-white">{formData?.developmentType || "Not set"}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400 block">Experience</span>
                  <span className="font-medium text-white">{formData?.experienceLevel || "Not set"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 p-6">
              <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* User Details Section */}
                <div className="space-y-6">
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData?.username || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-white"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData?.email || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-white"
                      required
                    />
                  </div>

                  {/* Development Type & Experience Level */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Development Type */}
                    <div>
                      <label htmlFor="developmentType" className="block text-sm font-medium text-gray-300 mb-1">
                        Development Specialty
                      </label>
                      <select
                        id="developmentType"
                        name="developmentType"
                        value={formData?.developmentType || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none text-white transition"
                        style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 9L10 12L13 9\" stroke=\"%23FFFFFF\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center" }}
                      >
                        {DEVELOPMENT_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-neutral-800 text-white">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Experience Level */}
                    <div>
                      <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-300 mb-1">
                        Experience Level
                      </label>
                      <select
                        id="experienceLevel"
                        name="experienceLevel"
                        value={formData?.experienceLevel || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none text-white transition"
                        style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 9L10 12L13 9\" stroke=\"%23FFFFFF\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center" }}
                      >
                        {EXPERIENCE_LEVELS.map((level) => (
                          <option key={level} value={level} className="bg-neutral-800 text-white">
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Status & Submit Button */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-3 sm:mb-0">
                      {formStatus && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-sm font-medium ${
                            formStatus.type === "success" ? "text-green-400" : "text-red-400"
                          } flex items-center`}
                        >
                          {formStatus.type === "success" ? (
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                          {formStatus.message}
                        </motion.div>
                      )}
                      {isDirty && !formStatus && (
                        <span className="text-sm text-amber-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                          You have unsaved changes
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving || (!isDirty && !saving)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        saving || !isDirty 
                          ? 'bg-green-800/30 text-green-400/50 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'
                      }`}
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : "Save Profile"}
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;