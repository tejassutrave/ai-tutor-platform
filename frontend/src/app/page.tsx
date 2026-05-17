"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-blue-600/10 px-3 py-1 text-sm font-semibold leading-6 text-blue-600 ring-1 ring-inset ring-blue-600/10">
                New: AI-Powered Notes
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Your Personal <span className="text-blue-600">AI Tutor</span> for Every Subject
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Master complex topics with personalized explanations, interactive quizzes, and automated study notes. 
            All powered by the latest Gemini 1.5 Flash model.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
            >
              Get started for free
            </Link>
            <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors">
              Log in <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="w-[40rem] h-[25rem] rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10 flex items-center justify-center text-gray-400 font-medium">
                [ AI Tutor Platform Dashboard Preview ]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
