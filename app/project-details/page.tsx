"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Lightbulb, Target, AlertTriangle, Users,
  Github, Linkedin, Facebook, GraduationCap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  studentId: string;
  department: string;
  university: string;
  photo: string;
  links: {
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
}

export default function ProjectDetailsPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("/team.json")
      .then((res) => res.json())
      .then((data) => setTeam(data))
      .catch((err) => console.error("Failed to fetch team data:", err));
  }, []);

  const sections = [
    {
      id: "idea",
      title: "Initial Idea",
      icon: Lightbulb,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20",
      content: "This project, 'Prohori', was conceived as a comprehensive digital resilience and security suite. It was initially developed to fulfill the requirements of the 'Design Project' course in the 4th year of the Computer Science and Engineering program at Green University of Bangladesh. The idea was to create an accessible, localized SIEM (Security Information and Event Management) tool that bridges the gap between complex enterprise security solutions and local organizational needs.",
    },
    {
      id: "motivation",
      title: "Project Motivation",
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
      content: "Cyber threats are evolving rapidly, yet many organizations in Bangladesh lack access to affordable, comprehensible security tools tailored to their regional context. The motivation behind Prohori is to democratize digital security by integrating AI-driven insights (including native Bengali support) with robust infrastructure monitoring, enabling businesses of all sizes to proactively defend their networks.",
    },
    {
      id: "objectives",
      title: "Objectives",
      icon: GraduationCap,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20",
      content: "1. To build a unified dashboard that consolidates security events and alerts in real-time.\n2. To integrate an AI Security Analyst capable of explaining complex threats in plain language.\n3. To automate compliance reporting aligned with the Bangladesh Cyber Security Act 2023.\n4. To implement a zero-trust architecture ensuring robust access verification.",
    },
    {
      id: "problem",
      title: "Problem Solving",
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-400/20",
      content: "Enterprise SIEM solutions are typically expensive, difficult to configure, and present data in highly technical jargon that requires specialized personnel to interpret. Prohori solves this by providing a streamlined, intuitive interface that leverages AI to translate raw logs into actionable intelligence, reducing the time to detection and response for organizations with limited dedicated security staff.",
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050505] to-[#050505] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            4th Year Design Project
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            About Prohori
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A comprehensive look into the conception, goals, and team behind the Prohori Digital Resilience Suite.
          </p>
        </motion.div>

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden relative group">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity`} />
                <CardContent className="p-8">
                  <div className={`w-12 h-12 rounded-xl ${section.bg} ${section.border} border flex items-center justify-center mb-6`}>
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                    {section.title}
                  </h3>
                  <div className="space-y-2 text-gray-400 leading-relaxed text-sm md:text-base">
                    {section.content.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3 mb-4">
              <Users className="w-8 h-8 text-cyan-400" />
              Meet the Team
            </h2>
            <p className="text-gray-400">The brilliant minds from Green University of Bangladesh</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group perspective"
              >
                <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full p-1 border-2 border-white/10 group-hover:border-cyan-500/50 transition-colors duration-500 mb-6">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-cyan-400/80 text-sm font-medium mb-4">{member.role}</p>

                    <div className="w-full h-px bg-white/10 mb-4" />

                    <div className="space-y-2 w-full text-sm text-gray-400 mb-6 text-left">
                      <p className="flex justify-between"><span className="text-gray-500">ID:</span> <span>{member.studentId}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Dept:</span> <span className="text-right truncate ml-2">{member.department}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Uni:</span> <span className="text-right truncate ml-2">{member.university}</span></p>
                    </div>

                    <div className="flex items-center gap-4 mt-auto">
                      {member.links.github && (
                        <a href={member.links.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {member.links.linkedin && (
                        <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[#0A66C2] text-gray-400 hover:text-white transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {member.links.facebook && (
                        <a href={member.links.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[#1877F2] text-gray-400 hover:text-white transition-colors">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
