// Home.tsx
import {  BackgroundLines } from "@/components/ui/background-beams";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Compare } from "@/components/ui/compare";
import { pricingCards } from "@/lib/constants";
import clsx from "clsx";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <>
      <section className="w-full pt-24 md:pt-24 relative flex items-center justify-center flex-col">

        
        {/* Grid background with proper height */}
        <div className="absolute bottom-0 left-0 right-0 h-screen bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] z-10 " />
        
        <BackgroundLines className="flex items-center justify-center flex-col gap-4">
        <p className="text-center relative z-10">Run your agency, in one place</p>
        
        {/* Gradient text */}
        <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-lg md:text-9xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          WEBRA
        </h1>
        </div>
        {/* Preview image section */}
        <div className="w-3/4 h-[64vh] px-1 md:px-8 flex items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
      <div
        style={{
          transform: "rotateX(15deg) translateZ(80px)",
        }}
        className="p-1 md:p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100  border-neutral-200 dark:border-neutral-800 mx-auto w-3/4 h-1/2 md:h-3/4"
      >
        <Compare
          firstImage="/assets/preview.png"
          secondImage="https://assets.aceternity.com/linear-dark.png"
          firstImageClassName="object-cover object-left-top w-full"
          secondImageClassname="object-cover object-left-top w-full"
          className="w-full h-full rounded-[22px] md:rounded-lg"
          showHandlebar={true}
          slideMode="hover"
          autoplay={true}
        />
      </div>
    </div>

            </BackgroundLines>
      </section>
      <section className="flex justify-center items-center flex-col gap-4 md:mt-20">
        <h2>
          Choose what fit your needs
        </h2>
          <p>
            Our strategy is to create a platform that is simple to use and easy to navigate. If {" you're"} not <br />
            ready to commit yourself to a long-term commitment, we also offer a free trial for 14 days.
          </p>
          <div className="flex justify-center items-center gap-4 flex-wrap mt-6">
              {pricingCards.map((card)=>
                <Card key={card.title} className={clsx('w-[300px] flex flex-col justify-between',{
                  'border-2 border-primary': card.title === 'Unlimited Saas',
                })}>
                 <CardHeader>
                  <CardTitle
                  className={clsx('',{
                    'text-muted-foreground': card.title === 'Unlimited Saas',
                  })}
                  >
                    {card.title}
                  </CardTitle>
                  <CardDescription>
                    {card.description}
                  </CardDescription>
                 </CardHeader>
                 <CardContent>
                  <span className="text-4xl font-bold">{card.price}</span>
                  <span className="text-muted-foreground">/m</span>
                 </CardContent>
                 <CardFooter className="flex flex-col items-start gap-4">
                    <div>
                      {card.features.map(feature=>(
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="text-muted-foreground"/>
                          <p>{feature}</p>
                        </div>
                      ))}
                    </div>
                    <Link href={`/agency/?plan=${card.priceId}`}
                    className={clsx('w-full text-center bg-primary p-2 rounded-md', {
                      '!bg-muted-foreground': card.title !== 'Unlimited Saas',
                    })}
                    >
                    Get Started
                    </Link>
                 </CardFooter>
                </Card>
              )}
          </div>
      </section>
    </>
  );
};

export default Home;