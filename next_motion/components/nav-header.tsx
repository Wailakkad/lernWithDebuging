"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import logoImg from "@/public/logoApp.png";
import Link from "next/link";

function NavHeader() {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <nav className="w-full py-1">
      <div className="w-full mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center mr-150">
          <img src={logoImg.src} alt="Logo" className="h-20 md:h-30 w-auto" />
        </div>
        
        {/* Navigation Section */}
        <ul
          className="relative flex w-fit rounded-full  bg-white p-1"
          onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
        >
          <Link href="/"><Tab setPosition={setPosition}>Home</Tab></Link>
          <Link href="/pages/AboutPage"><Tab setPosition={setPosition}>About</Tab></Link>
          <Tab setPosition={setPosition}>Services</Tab>
          
          
          <Cursor position={position} />
        </ul>
      </div>
    </nav>
  );
}

const Tab = ({
  children,
  setPosition,
}: {
  children: React.ReactNode;
  setPosition: React.Dispatch<React.SetStateAction<{
    left: number;
    width: number;
    opacity: number;
  }>>;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }: { position: { left: number; width: number; opacity: number } }) => {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-7 rounded-full bg-black md:h-12"
    />
  );
};

export default NavHeader;