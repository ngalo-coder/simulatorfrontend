import React, { useState } from "react";
import {
  Book,
  Users,
  MessageSquare,
  Award,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  User,
  Settings,
  LogOut,
  Home,
  ArrowLeft,
  ArrowRight,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Stethoscope,
  FileText,
  BarChart,
  Search,
  Download,
} from "lucide-react";

interface UserGuideProps {
  onClose: () => void;
  userRole?: "user" | "admin";
}

const UserGuide: React.FC<UserGuideProps> = ({
  onClose,
  userRole = "user",
}) => {
  const [activeSection, setActiveSection] = useState<string>("getting-started");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Home className="w-5 h-5" />,
      content: (
        <div>
          <h3 className="text-xl font-bold mb-4">Welcome to Simuatech</h3>
          <p className="mb-4">
            Simuatech is a medical simulation platform designed to help
            clinicians practice and improve their clinical skills through
            AI-powered virtual patient interactions.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="font-medium">The platform offers:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Virtual patient cases across multiple specialties</li>
              <li>Realistic clinical conversations with AI patients</li>
              <li>Detailed performance evaluations</li>
              <li>Progress tracking and skill development</li>
            </ul>
          </div>
          <h4 className="text-lg font-semibold mb-2">Basic Navigation</h4>
          <p className="mb-4">
            The main navigation bar at the top of the screen allows you to
            access your dashboard, start new simulations, and manage your
            account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Home</span>
              </div>
              <p className="text-sm text-gray-600">
                Return to the main program area selection screen
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Dashboard</span>
              </div>
              <p className="text-sm text-gray-600">
                View your progress and performance metrics
              </p>
            </div>
            {userRole === "admin" && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Admin</span>
                </div>
                <p className="text-sm text-gray-600">
                  Access administrative functions and system management
                </p>
              </div>
            )}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-medium">Logout</span>
              </div>
              <p className="text-sm text-gray-600">Sign out of your account</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "simulation-flow",
      title: "Simulation Flow",
      icon: <MessageSquare className="w-5 h-5" />,
      content: (
        <div>
          <h3 className="text-xl font-bold mb-4">How Simulations Work</h3>
          <p className="mb-6">
            The simulation process follows a structured flow to provide a
            realistic clinical experience. Follow these steps to complete a
            simulation:
          </p>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

            <div className="relative flex mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full border-2 border-blue-300 z-10">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <div className="ml-6">
                <h4 className="text-lg font-semibold mb-2">
                  Select a Program Area
                </h4>
                <p className="text-gray-700 mb-2">
                  Choose from various medical specialties like Internal
                  Medicine, Pediatrics, or Emergency Medicine.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tip:</span> Hover over each
                    program area to see how many cases are available.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full border-2 border-blue-300 z-10">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
              <div className="ml-6">
                <h4 className="text-lg font-semibold mb-2">
                  Choose a Specialty
                </h4>
                <p className="text-gray-700 mb-2">
                  Narrow down your selection to a specific specialty within the
                  program area.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tip:</span> You can always go
                    back to change your program area selection.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full border-2 border-blue-300 z-10">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <div className="ml-6">
                <h4 className="text-lg font-semibold mb-2">
                  Select a Patient Case
                </h4>
                <p className="text-gray-700 mb-2">
                  Browse available cases and select one based on your learning
                  objectives. Each case includes information about difficulty
                  level and estimated completion time.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tip:</span> Start with easier
                    cases and progress to more challenging ones as you gain
                    experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full border-2 border-blue-300 z-10">
                <span className="text-blue-600 font-bold text-xl">4</span>
              </div>
              <div className="ml-6">
                <h4 className="text-lg font-semibold mb-2">
                  Conduct the Clinical Interview
                </h4>
                <p className="text-gray-700 mb-2">
                  Interact with the virtual patient by asking questions and
                  gathering information. The AI will respond realistically based
                  on the case scenario.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tip:</span> Use a systematic
                    approach to history taking, just as you would in a real
                    clinical setting.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full border-2 border-blue-300 z-10">
                <span className="text-blue-600 font-bold text-xl">5</span>
              </div>
              <div className="ml-6">
                <h4 className="text-lg font-semibold mb-2">
                  Review Your Performance
                </h4>
                <p className="text-gray-700 mb-2">
                  After completing the case, you'll receive a detailed
                  evaluation of your performance, including strengths and areas
                  for improvement.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tip:</span> You can download
                    your evaluation report for future reference or to discuss
                    with mentors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "chat-interface",
      title: "Chat Interface",
      icon: <MessageSquare className="w-5 h-5" />,
      content: (
        <div>
          <h3 className="text-xl font-bold mb-4">Using the Chat Interface</h3>
          <p className="mb-6">
            The chat interface is where you'll conduct your clinical interview
            with the virtual patient. Here's how to use it effectively:
          </p>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Asking Questions
              </h4>
              <p className="text-gray-700 mb-3">
                Type your questions or statements in the text input at the
                bottom of the screen and press Enter or click the Send button.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Example questions:</span>
                </p>
                <ul className="list-disc ml-6 mt-1 space-y-1 text-sm text-gray-600">
                  <li>
                    "Can you tell me what brought you to the hospital today?"
                  </li>
                  <li>"How long have you been experiencing this pain?"</li>
                  <li>"Do you have any allergies to medications?"</li>
                  <li>"Have you had any similar symptoms in the past?"</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Response Time
              </h4>
              <p className="text-gray-700">
                The virtual patient will respond in real-time, with a typing
                indicator showing when they're preparing a response. This
                simulates the natural flow of a clinical conversation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Ending the Session
              </h4>
              <p className="text-gray-700 mb-3">
                When you feel you've gathered enough information, you can end
                the session by clicking the "End Session" button. This will
                trigger the evaluation process.
              </p>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Note:</span> Once you end a
                  session, you cannot continue with the same case. Make sure
                  you've asked all necessary questions before ending.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 text-blue-600" />
                Navigation Options
              </h4>
              <p className="text-gray-700">
                During the simulation, you can use the navigation buttons to
                restart the simulation or go back to the case selection screen
                if needed.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "evaluation",
      title: "Performance Evaluation",
      icon: <Award className="w-5 h-5" />,
      content: (
        <div>
          <h3 className="text-xl font-bold mb-4">
            Understanding Your Evaluation
          </h3>
          <p className="mb-6">
            After completing a case, you'll receive a comprehensive evaluation
            of your performance. Here's how to interpret and use this
            information:
          </p>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Performance Metrics
              </h4>
              <p className="text-gray-700 mb-3">
                Your performance is evaluated across several key clinical
                competencies:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-1">
                    History Taking
                  </p>
                  <p className="text-sm text-gray-600">
                    Thoroughness and relevance of your questions
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-1">
                    Risk Factor Assessment
                  </p>
                  <p className="text-sm text-gray-600">
                    Identification of relevant risk factors
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-1">
                    Differential Diagnosis
                  </p>
                  <p className="text-sm text-gray-600">
                    Exploration of possible diagnoses
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-1">
                    Communication & Empathy
                  </p>
                  <p className="text-sm text-gray-600">
                    Patient interaction quality
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-1">
                    Clinical Urgency
                  </p>
                  <p className="text-sm text-gray-600">
                    Recognition of time-sensitive issues
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-1">
                    Overall Score
                  </p>
                  <p className="text-sm text-gray-600">
                    Composite performance rating
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Detailed Feedback
              </h4>
              <p className="text-gray-700 mb-3">
                You'll receive specific feedback on what you did well and areas
                where you could improve. This includes:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Analysis of your questioning strategy</li>
                <li>Identification of missed critical questions</li>
                <li>Assessment of your communication approach</li>
                <li>Suggestions for improvement in future cases</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Saving Your Results
              </h4>
              <p className="text-gray-700 mb-3">
                You can download both your evaluation report and conversation
                history for future reference:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-1">
                    Evaluation Report
                  </p>
                  <p className="text-sm text-gray-600">
                    Contains your complete performance assessment
                  </p>
                </div>
                <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-1">
                    Conversation History
                  </p>
                  <p className="text-sm text-gray-600">
                    Full transcript of your patient interaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Using Your Dashboard",
      icon: <User className="w-5 h-5" />,
      content: (
        <div>
          <h3 className="text-xl font-bold mb-4">Clinician Dashboard</h3>
          <p className="mb-6">
            Your dashboard provides a comprehensive overview of your performance
            and progress. Use it to track your development and identify areas
            for improvement.
          </p>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Performance Overview
              </h4>
              <p className="text-gray-700 mb-3">
                View your aggregate performance metrics across all completed
                cases:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Overall performance score</li>
                <li>Competency-specific ratings</li>
                <li>Progress over time</li>
                <li>Comparison to peers (anonymized)</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Case History
              </h4>
              <p className="text-gray-700 mb-3">
                Access a complete history of all cases you've completed:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Case details and completion dates</li>
                <li>Performance scores for each case</li>
                <li>Links to full evaluation reports</li>
                <li>Option to retry similar cases</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Recommended Cases
              </h4>
              <p className="text-gray-700 mb-3">
                Based on your performance history, the system will recommend
                cases to help you improve specific skills:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Pro Tip:</span> Focus on cases
                  that target your areas for improvement to develop a
                  well-rounded skill set.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  if (userRole === "admin") {
    sections.push({
      id: "admin-features",
      title: "Admin Features",
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div>
          <h3 className="text-xl font-bold mb-4">Administrator Dashboard</h3>
          <p className="mb-6">
            As an administrator, you have access to additional features for
            managing the system and monitoring user performance.
          </p>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                User Management
              </h4>
              <p className="text-gray-700 mb-3">
                Manage user accounts and permissions:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>View all registered users</li>
                <li>Add new users or administrators</li>
                <li>Update user roles and permissions</li>
                <li>Delete user accounts when necessary</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Case Management
              </h4>
              <p className="text-gray-700 mb-3">
                Oversee the virtual patient case library:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>View all available cases</li>
                <li>Update case metadata (program area, specialty)</li>
                <li>Monitor case usage statistics</li>
                <li>Remove outdated or problematic cases</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-purple-600" />
                System Statistics
              </h4>
              <p className="text-gray-700 mb-3">
                Access comprehensive system usage statistics:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>User engagement metrics</li>
                <li>Case completion rates</li>
                <li>Performance distribution across users</li>
                <li>System activity over time</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Running Simulations
              </h4>
              <p className="text-gray-700 mb-3">
                Administrators can also run simulations to test the system:
              </p>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                <li>
                  Click the "Start Simulation" button in the admin dashboard
                </li>
                <li>
                  Follow the same flow as regular users to select a program
                  area, specialty, and case
                </li>
                <li>Complete the simulation to test the case functionality</li>
                <li>
                  Review the evaluation to ensure the assessment system is
                  working correctly
                </li>
              </ol>
              <div className="bg-purple-50 p-4 rounded-lg mt-3">
                <p className="text-sm text-purple-800">
                  <span className="font-medium">Note:</span> Admin simulations
                  are marked differently in the system for reporting purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Simuatech User Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            aria-label="Close guide"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden p-4 border-b">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg"
            >
              <span className="font-medium">Select a Topic</span>
              {showMobileMenu ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Sidebar */}
          <div
            className={`${
              showMobileMenu ? "block" : "hidden"
            } md:block w-full md:w-64 bg-gray-50 border-r overflow-y-auto`}
          >
            <nav className="p-4">
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => {
                        setActiveSection(section.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeSection === section.id
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      {section.icon}
                      <span className="font-medium">{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {sections.find((s) => s.id === activeSection)?.content}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <p>Simuatech © 2025 - All rights reserved</p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
