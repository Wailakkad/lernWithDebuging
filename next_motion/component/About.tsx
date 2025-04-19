"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";
import image from "../images/image.png"

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden mt-40 ">
      <ContainerScroll
        titleComponent={
            <>
            <h1 className="text-4xl font-semibold text-black dark:text-white mb-20">
              Navigate code errors like <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Mission Control
              </span>
            </h1>
          </>
        }
      >
        <Image
          src={image}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top w-full"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
