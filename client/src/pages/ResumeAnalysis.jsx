import React from "react";

function ResumeAnalysis() {
  const analysis = JSON.parse(
    localStorage.getItem("resumeAnalysis")
  );

  if (!analysis) {
    return (
      <h1 className="text-white p-10">
        No Analysis Found
      </h1>
    );
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-4xl font-bold text-green-400 mb-8">
        Resume Analysis
      </h1>

      <div className="bg-gray-900 p-6 rounded mb-6">
        <h2 className="text-2xl font-bold">
          Resume Score
        </h2>

        <p className="text-5xl text-green-400 mt-3">
          {analysis.score}/100
        </p>
      </div>

      <div className="bg-gray-900 p-6 rounded mb-6">
        <h2 className="text-2xl font-bold mb-3">
          Skills
        </h2>

        {analysis.skills?.map((skill, index) => (
          <p key={index}>✅ {skill}</p>
        ))}
      </div>

      <div className="bg-gray-900 p-6 rounded mb-6">
        <h2 className="text-2xl font-bold mb-3">
          Missing Skills
        </h2>

        {analysis.missingSkills?.map(
          (skill, index) => (
            <p key={index}>❌ {skill}</p>
          )
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded mb-6">
        <h2 className="text-2xl font-bold mb-3">
          Strengths
        </h2>

        {analysis.strengths?.map(
          (item, index) => (
            <p key={index}>⭐ {item}</p>
          )
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded">
        <h2 className="text-2xl font-bold mb-3">
          Suggestions
        </h2>

        {analysis.suggestions?.map(
          (item, index) => (
            <p key={index}>💡 {item}</p>
          )
        )}
      </div>
    </div>
  );
}

export default ResumeAnalysis;