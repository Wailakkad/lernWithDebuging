import { FaqSection } from "@/components/faq";

const DEMO_FAQS = [
    {
      question: "How does your debugging tool help beginners learn?",
      answer: "Our platform not only fixes your code errors but provides detailed explanations of what went wrong and why the solution works. You'll learn common pitfalls and best practices through real examples from your own code.",
    },
    {
      question: "What programming languages do you support?",
      answer: "We currently support JavaScript, TypeScript, Python, and Java, with more languages coming soon. Our AI understands language-specific patterns and common beginner mistakes in each supported language.",
    },
    {
      question: "How does the exercise generation feature work?",
      answer: "After debugging your code, you can request practice exercises tailored to your specific error. These include similar challenges with progressive hints to reinforce your learning and prevent repeating the same mistakes.",
    },
    {
      question: "Can I use this for team training or classrooms?",
      answer: "Absolutely! Our platform is perfect for coding bootcamps, computer science classes, and developer onboarding. The exercise generator creates unlimited practice material based on real coding issues.",
    },
    {
      question: "What makes your debugging better than standard linters?",
      answer: "While linters catch syntax errors, we explain the conceptual mistakes behind them. Our AI analyzes your code's intent, not just its syntax, providing human-like explanations of logical errors and anti-patterns.",
    },
    {
      question: "How current are your learning recommendations?",
      answer: "Our AI models are regularly updated with the latest best practices and common mistakes from real beginner code. You'll always get modern, relevant advice for today's development environments.",
    }
  ];

export function FaqSectionDemo() {
  return (
    <FaqSection
      title="Frequently Asked Questions"
      description="Everything you need to know about our platform"
      items={DEMO_FAQS}
      contactInfo={{
        title: "Still have questions?",
        description: "We're here to help you",
        buttonText: "Contact Support",
        onContact: () => console.log("Contact support clicked"),
      }}
    />
  );
}
