export default function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: 'Upload Resume' },
    { num: 2, label: 'Add Jobs' },
    { num: 3, label: 'View Results' },
  ]

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${currentStep > step.num ? 'bg-green-500 text-white' : ''}
                ${currentStep === step.num ? 'bg-navy-800 bg-gray-900 text-white ring-4 ring-gray-200' : ''}
                ${currentStep < step.num ? 'bg-gray-200 text-gray-500' : ''}
              `}
            >
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span
              className={`mt-1 text-xs font-medium ${
                currentStep === step.num ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-20 h-0.5 mb-4 mx-1 transition-all ${
                currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
