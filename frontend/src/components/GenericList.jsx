import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const GenericList = ({ title, data, columns, onAdd, onEdit, onDelete, onRowClick }) => {
    const [search, setSearch] = useState('');

    const filtered = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-text-text-primary">{title}</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-2.5 text-text-text-secondary w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search criteria..."
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {onAdd && <Button onClick={onAdd} icon={Plus}>Add New</Button>}
                </div>
            </div>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50/30 border-b border-gray-200">
                                {columns.map((col, i) => <th key={i} className="p-4 font-semibold text-text-text-secondary text-sm">{col.header}</th>)}
                                {(onEdit || onDelete) && <th className="p-4 font-semibold text-text-text-secondary text-sm text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((col, i) => (
                                        <td key={i} className="p-4 text-sm text-text-text-primary">{col.render ? col.render(item) : item[col.field]}</td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="text-info hover:text-blue-700 p-1"><Edit2 size={16} /></button>}
                                            {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-error hover:text-red-700 p-1"><Trash2 size={16} /></button>}
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="p-8 text-center text-text-text-secondary">No records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default GenericList;
