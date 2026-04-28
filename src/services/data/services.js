import { Monitor, MessageSquare, Palette, Mail, Brain, RefreshCw, FileText } from 'lucide-react';

export const services = [
  {
    id: 'website-development',
    title: 'Website Development',
    description: 'Professional website development solutions tailored to your needs.',
    icon: Monitor,
    gradient: 'text-blue-400',
    navigator: '/website-development'
  },
  {
    id: 'social-media',
    title: 'Social Media',
    description: 'Strategic social media management and growth solutions.',
    icon: MessageSquare,
    gradient: 'text-indigo-400',
    navigator: '/social-media'
  },
  {
    id: 'branding-design',
    title: 'Branding and Design Services',
    description: 'Creative branding and design solutions to make your business stand out.',
    icon: Palette,
    gradient: 'text-purple-400',
    subServices: [
      {
        id: 'logo-design',
        title: 'Logo Design',
        description: 'Professional logo and brand identity design',
        navigator: '/logo-design'
      },
      {
        id: 'rebranding',
        title: 'Rebranding',
        description: 'Complete brand refresh and repositioning',
        icon: RefreshCw,
        navigator: '/rebranding'
      },
      {
        id: 'brand-development',
        title: 'Brand Development',
        description: 'Comprehensive brand strategy and identity development',
        icon: FileText,
        navigator: '/brand-development'
      },
      {
        id: 'brand-guidelines',
        title: 'Brand Guidelines',
        description: 'Comprehensive brand style guides',
        navigator: '/brand-guidelines'
      }
    ],
    navigator: '/branding-design'
  },
  {
    id: 'email-marketing',
    title: 'Email Marketing',
    description: 'Effective email marketing campaigns that drive engagement.',
    icon: Mail,
    gradient: 'text-emerald-400',
    navigator: '/email-marketing'
  },
  {
    id: 'ai-integrations',
    title: 'AI Integrations',
    description: 'Cutting-edge AI solutions to automate and enhance your business.',
    icon: Brain,
    gradient: 'text-blue-400',
    navigator: '/ai-integrations'
  }
];