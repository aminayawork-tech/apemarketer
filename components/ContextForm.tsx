"use client";

interface ContextData {
  businessType: string;
  targetCustomers: string;
  goals: string;
  constraints: string;
  additionalNotes: string;
}

interface ContextFormProps {
  context: ContextData;
  onChange: (context: ContextData) => void;
  disabled?: boolean;
}

export default function ContextForm({ context, onChange, disabled }: ContextFormProps) {
  const handleChange = (field: keyof ContextData, value: string) => {
    onChange({ ...context, [field]: value });
  };

  const inputClass = `
    w-full bg-[#F9FBF7] border border-[#C5DBAA] rounded-lg px-4 py-2.5 text-[#1A2710]
    placeholder-[#8AAD6A] focus:outline-none focus:border-[#3D7018] focus:ring-1 focus:ring-[#3D7018]/40
    transition-colors duration-200 text-sm
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className="space-y-4">
      <h2 className="text-[#B8680A] font-bold text-lg">
        Business Context
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#2D5016] uppercase tracking-wider">
            Business Type
          </label>
          <input
            type="text"
            value={context.businessType}
            onChange={(e) => handleChange("businessType", e.target.value)}
            placeholder="Convenience store, restaurant, salon..."
            className={inputClass}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#2D5016] uppercase tracking-wider">
            Target Customers
          </label>
          <input
            type="text"
            value={context.targetCustomers}
            onChange={(e) => handleChange("targetCustomers", e.target.value)}
            placeholder="Young professionals, families, commuters..."
            className={inputClass}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#2D5016] uppercase tracking-wider">
            Goals
          </label>
          <input
            type="text"
            value={context.goals}
            onChange={(e) => handleChange("goals", e.target.value)}
            placeholder="Increase impulse buys, drive foot traffic..."
            className={inputClass}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#2D5016] uppercase tracking-wider">
            Constraints
          </label>
          <input
            type="text"
            value={context.constraints}
            onChange={(e) => handleChange("constraints", e.target.value)}
            placeholder="Tight budget, need manager approval..."
            className={inputClass}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[#2D5016] uppercase tracking-wider">
          Additional Notes
        </label>
        <textarea
          value={context.additionalNotes}
          onChange={(e) => handleChange("additionalNotes", e.target.value)}
          placeholder="Any other details about the location, recent changes, what's been tried before..."
          rows={3}
          className={`${inputClass} resize-none`}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
