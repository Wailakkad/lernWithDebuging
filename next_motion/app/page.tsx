"use client";

import {LandingHero} from "@/component/Home";
import { NavbarDemo } from "@/component/Nvbar";
import {HeroScrollDemo} from "@/component/About";
import {AnimatedCardBackgroundHover} from "@/component/Missions";

export default function Home() {
  return (
   <div className="flex flex-col items-center justify-between min-h-screen px-20 ">
      <NavbarDemo/>
      <LandingHero/>
      <HeroScrollDemo/>
      <AnimatedCardBackgroundHover/>
      
   </div>
  );
}
