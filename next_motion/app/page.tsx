"use client";

import {LandingHero} from "@/component/Home";

import {HeroScrollDemo} from "@/component/About";
import {AnimatedCardBackgroundHover} from "@/component/Missions";

export default function Home() {
  return (
   <div className="flex flex-col items-center justify-between min-h-screen p-24">
      <LandingHero/>
      <HeroScrollDemo/>
      <AnimatedCardBackgroundHover/>
      
   </div>
  );
}
