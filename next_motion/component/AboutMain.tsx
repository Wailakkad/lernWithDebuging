import { motion } from 'framer-motion';
import { FC } from 'react';
import { GradientButton } from "@/components/ui/gradient-button"
import Link from 'next/link';


const AboutMain: FC = () => {
  // Animation variants for staggered entrance effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Animation variants for the accent line
  const lineVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        delay: 0.5,
      },
    },
  };

  // Interactive element animation
  const interactiveVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(74, 222, 128, 0.2)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Workflow indicator - similar to reference image */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center mb-12"
      >
        <div className="h-6 w-6 rounded bg-[#aacc00] flex items-center justify-center mr-3">
          <span className="text-black text-sm font-bold">#</span>
        </div>
        <span className="text-sm font-medium text-[#aacc00]">Our workflow</span>
      </motion.div>

      {/* Main content container with staggered animations */}
      <motion.div 
        className="grid md:grid-cols-2 gap-x-12 gap-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left column - Headings */}
        <motion.div variants={itemVariants} className="flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            On Debugging
          </h1>
          
          <motion.div 
            className="h-1 bg-[#aacc00] mb-6 rounded-full" 
            variants={lineVariants}
          />
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-[#eafaed] mb-6">
            Unlock the future of <br />error resolution
          </h2>
        </motion.div>

        {/* Right column - Description */}
        <motion.div variants={itemVariants} className="flex flex-col justify-center">
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            DebugLern was born from realizing traditional debugging tools don't support the learning process. 
            As coding becomes more complex, beginners often struggle with opaque error messages and lack contextual solutions.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We've created an environment where mistakes are not just fixed, but understood. Our platform provides 
            context, explanations, and learning paths that transform debugging from a frustrating roadblock to 
            an educational opportunity.
          </p>
        </motion.div>
      </motion.div>

      {/* Interactive element demonstrating learning from mistakes */}
      <motion.div 
        className="mt-16 p-6 bg-[#243b37] rounded-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h3 
          variants={itemVariants}
          className="text-xl font-semibold mb-4 text-[#aacc00] flex items-center"
        >
          <span className="inline-block h-4 w-4 bg-[#aacc00] mr-3 rounded-sm"></span>
          How We Transform Debugging
        </motion.h3>
        
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {/* Step 1 */}
          <motion.div
            variants={interactiveVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="bg-[#eafaed] p-6 rounded-lg shadow-sm border border-gray-100 transition-all"
          >
            <div className="h-10 w-10 bg-black text-[#aacc00] rounded-full flex items-center justify-center mb-4 font-semibold">1</div>
            <h4 className="font-medium text-lg mb-2 text-gray-800">Identify</h4>
            <p className="text-gray-600">Clear error identification with plain language explanations for beginners.</p>
          </motion.div>
          
          {/* Step 2 */}
          <motion.div
            variants={interactiveVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="bg-[#eafaed] p-6 rounded-lg shadow-sm border border-gray-100 transition-all"
          >
            <div className="h-10 w-10 bg-black text-[#aacc00] rounded-full flex items-center justify-center mb-4 font-semibold">2</div>
            <h4 className="font-medium text-lg mb-2 text-gray-800">Learn</h4>
            <p className="text-gray-600">Contextual resources that explain not just how to fix, but why errors occur.</p>
          </motion.div>
          
          {/* Step 3 */}
          <motion.div
            variants={interactiveVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="bg-[#eafaed] p-6 rounded-lg shadow-sm border border-gray-100 transition-all"
          >
            <div className="h-10 w-10 bg-black text-[#aacc00] rounded-full flex items-center justify-center mb-4 font-semibold">3</div>
            <h4 className="font-medium text-lg mb-2 text-gray-800">Grow</h4>
            <p className="text-gray-600">Track your learning progress and build a deeper understanding of your code.</p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* CTA button */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
     <Link href="/pages/debuging_page">
     <GradientButton variant="variant">
       <span>Start learning</span>
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
       </GradientButton>
     </Link>
      </motion.div>
    </section>
  );
};

export default AboutMain;