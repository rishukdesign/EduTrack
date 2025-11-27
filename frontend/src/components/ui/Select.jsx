import { ChevronDown } from 'lucide-react';

const Select = ({ label, options, error, ...props }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
            <select className={`w-full px-3 py-2 pr-10 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'}`} {...props}>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 animate-fade-in">{error}</p>}
    </div>
);

export default Select;
