import AnimatedBackground from '@/components/ui/animated-background';

export function AnimatedCardBackgroundHover() {
    const ITEMS = [
        {
          id: 1,
          title: 'Instant Code Analysis',
          description: 'Get detailed explanations of errors in your code instantly.',
        },
        {
          id: 2,
          title: 'Smart Debugging',
          description: 'Our AI identifies and fixes common coding mistakes automatically.',
        },
        {
          id: 3,
          title: 'Personalized Exercises',
          description: 'Generate practice exercises tailored to your specific errors.',
        },
        {
          id: 4,
          title: 'Multi-Language Support',
          description: 'Works with JavaScript, Python, Java, and other popular languages.',
        },
        {
          id: 5,
          title: 'Beginner-Friendly Explanations',
          description: 'Clear, simple explanations without technical jargon.',
        },
        {
          id: 6,
          title: 'Error Pattern Recognition',
          description: 'Identifies recurring mistakes in your learning journey.',
        },
        {
          id: 7,
          title: 'Progress Tracking',
          description: 'Track your improvement in fixing different error types.',
        },
        {
          id: 8,
          title: 'Community Solutions',
          description: 'See how other developers solved similar problems.',
        }
      ];
  return (
    <div className='grid grid-cols-2 p-10 md:grid-cols-3'>
      <AnimatedBackground
        className='rounded-lg' // Removed original background
        bgClassName='bg-green-200 dark:bg-green-800' // Green animated background
        hoverClassName='bg-green-100 dark:bg-green-900/30' // Lighter green on hover
        transition={{
          type: 'spring',
          bounce: 0.2,
          duration: 0.6,
        }}
        enableHover
      >
        {ITEMS.map((item, index) => (
          <div key={index} data-id={`card-${index}`}>
            <div className='flex select-none flex-col space-y-1 p-4'>
              <h3 className='text-base font-medium text-zinc-800 dark:text-zinc-50'>
                {item.title}
              </h3>
              <p className='text-base text-zinc-600 dark:text-zinc-400'>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </AnimatedBackground>
    </div>
  );
}