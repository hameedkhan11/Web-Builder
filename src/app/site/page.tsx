// Home.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="absolute bottom-0 left-0 right-0 h-screen bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" />
        
        <p className="text-center relative z-10">Run your agency, in one place</p>
        
        {/* Gradient text */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text relative z-10">
          <h1 className="text-7xl font-bold text-center md:text-[200px]">
            Plura
          </h1>
        </div>
        
        {/* Preview image section */}
        <div className="flex justify-center items-center relative mt-8 md:mt-0 z-[1]">
          <Image
            src={'/assets/preview.png'}
            alt="banner image"
            height={1000}
            width={1000}
            className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted"
          />
          {/* Gradient overlay */}
          <div className="bottom-0 top-[50%] bg-gradient-to-t from-background/80 to-transparent dark:from-background left-0 right-0 absolute"></div>
        </div>
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