import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  BarChart3,
  Users,
  Calendar,
  LayoutDashboard,
  Star,
  ChevronDown,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Zap,
  Target,
  HeartHandshake,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUpChild = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      className="text-center mb-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">{subtitle}</p>}
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light via-background to-white pointer-events-none" />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' as const }}
          >
            <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary-light text-primary hover:bg-primary-light border-0 rounded-full">
              <Sparkles className="w-4 h-4 mr-1.5" />
              AI-Powered Teacher Matching
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight max-w-4xl mx-auto">
              Find the Perfect Teacher for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Your Child's Unique Mind
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
              Bonafide uses advanced artificial intelligence to match your child with
              the ideal teacher based on learning style, personality, and academic needs.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' as const }}
          >
            <Button
              size="xl"
              className="w-full sm:w-auto shadow-lg shadow-primary/20"
              onClick={() => navigate('/register')}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate('/parent/matching')}
            >
              Find Teachers
            </Button>
          </motion.div>

          <motion.div
            className="mt-14 flex flex-wrap justify-center gap-8 md:gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { value: '500+', label: 'Teachers' },
              { value: '10,000+', label: 'Sessions' },
              { value: '98%', label: 'Satisfaction' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="Why Choose Bonafide?"
            subtitle="We combine cutting-edge AI with educational expertise to find your child's perfect match."
          />
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { icon: Brain, title: 'AI-Powered Matching', description: 'Our algorithm analyzes learning styles, personality traits, and academic goals to find the perfect teacher match.' },
              { icon: Sparkles, title: 'Personalized Learning', description: 'Each child receives a tailored learning plan adapted to their unique pace, strengths, and areas for growth.' },
              { icon: BarChart3, title: 'Progress Tracking', description: 'Real-time dashboards show learning milestones, skill mastery, and areas needing attention.' },
              { icon: Users, title: 'Expert Teachers', description: 'All educators are rigorously vetted, certified, and trained in modern pedagogical techniques.' },
              { icon: Calendar, title: 'Flexible Scheduling', description: 'Book sessions that fit your family\'s schedule — mornings, evenings, or weekends.' },
              { icon: LayoutDashboard, title: 'Parent Dashboard', description: 'Stay informed with detailed reports, session recordings, and direct messaging with teachers.' },
            ].map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUpChild}>
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            title="How It Works"
            subtitle="Four simple steps to unlock your child's full potential."
          />
          <motion.div
            className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { step: 1, icon: Users, title: 'Create Profile', description: 'Tell us about your child\'s learning needs, goals, and preferences.' },
              { step: 2, icon: Brain, title: 'AI Assessment', description: 'Our AI evaluates learning style and matches with ideal teachers.' },
              { step: 3, icon: Target, title: 'Get Matched', description: 'Receive curated teacher recommendations with detailed profiles.' },
              { step: 4, icon: BookOpen, title: 'Start Learning', description: 'Begin sessions and watch your child thrive.' },
            ].map((item, i) => (
              <motion.div key={item.step} className="relative text-center" variants={fadeUpChild}>
                <div className="relative inline-flex items-center justify-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-primary text-primary text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">{item.description}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[calc(80%)] h-0.5 bg-gradient-to-r from-primary-light to-secondary/50" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="What Parents Say"
            subtitle="Hear from families who have transformed their child's learning journey."
          />
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { name: 'Sarah Mitchell', role: 'Parent of a 9-year-old', quote: 'Bonafide matched my son with a teacher who finally understands his learning style. His confidence has soared!', stars: 5 },
              { name: 'James Chen', role: 'Parent of a 12-year-old', quote: 'The AI assessment was scarily accurate. Within a week, our daughter was excited about learning again.', stars: 5 },
              { name: 'Amara Patel', role: 'Parent of a 7-year-old', quote: 'Flexible scheduling and progress tracking make this a game-changer for busy families. Highly recommend!', stars: 5 },
            ].map((t) => (
              <motion.div key={t.name} variants={fadeUpChild}>
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="Trusted by Thousands of Families"
            subtitle="Our growing community speaks for itself."
          />
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { value: '500+', label: 'Teachers' },
              { value: '10,000+', label: 'Sessions' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '50,000+', label: 'Happy Parents' },
            ].map((stat) => (
              <AnimatedCounter key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about Bonafide."
          />
          <div className="space-y-3">
            {[
              { q: 'How does the AI matching work?', a: 'Our AI analyzes your child\'s learning preferences, personality traits, academic performance, and specific goals using a comprehensive assessment. It then cross-references this data with teacher profiles to find the optimal match.' },
              { q: 'Is there a free trial available?', a: 'Yes! We offer a 7-day free trial with one fully matched teacher session so you can experience the difference before committing to a plan.' },
              { q: 'Can I switch teachers if it\'s not a good fit?', a: 'Absolutely. We understand the importance of the right fit. You can request a new match at any time at no extra cost until you find the perfect teacher.' },
              { q: 'What subjects do you cover?', a: 'We cover all core K-12 subjects including Math, Science, English, History, and Languages. We also offer test preparation, coding, music, and specialized enrichment programs.' },
              { q: 'How are teachers vetted?', a: 'All teachers undergo a rigorous multi-step vetting process including background checks, credential verification, teaching demonstrations, and ongoing performance evaluations.' },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="relative rounded-xl bg-gradient-to-br from-primary to-secondary p-10 md:p-16 text-center overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Child's Learning?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of happy parents. Start your free trial today with no commitment required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="xl"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-blue-50 shadow-lg"
                  onClick={() => navigate('/register')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                     className="w-full sm:w-auto bg-white text-primary hover:bg-blue-50 shadow-lg"
                  onClick={() => navigate('/parent/matching')}
                >
                  Browse Teachers
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function AnimatedCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const numeric = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9,]/g, '');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(numeric / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) {
        setCount(numeric);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, numeric]);

  return (
    <motion.div ref={ref} className="text-center text-white" variants={fadeUpChild}>
      <div className="text-3xl md:text-4xl font-bold">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-blue-200 text-sm mt-2">{label}</div>
    </motion.div>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div
        className={`rounded-lg border transition-all duration-300 cursor-pointer ${
          open ? 'border-primary shadow-sm' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between p-5">
          <span className="text-base font-medium text-gray-900 pr-4">{question}</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{answer}</p>
        </div>
      </div>
    </motion.div>
  );
}
