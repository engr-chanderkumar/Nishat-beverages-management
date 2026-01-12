import React from 'react'

export const TailwindTest = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-brand-blue mb-4">Tailwind Test</h1>
      <div className="bg-brand-lightblue text-white p-4 rounded-lg">
        <p className="text-lg">If this is styled, Tailwind is working!</p>
      </div>
      <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded">
        Test Button
      </button>
    </div>
  )
}
