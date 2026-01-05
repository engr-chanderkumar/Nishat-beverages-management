import React, { useState, useEffect } from 'react';
import { Customer, Salesman, AreaAssignment } from '../../types';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCustomer: (customer: Omit<Customer, 'id' | 'salesmanAssignmentHistory'>) => void;
    salesmen: Salesman[];
    areas?: string[];
    areaAssignments?: AreaAssignment[];
    onNavigateToAreaAssignment?: () => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onAddCustomer, salesmen, areas = [], areaAssignments = [], onNavigateToAreaAssignment }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [mobile, setMobile] = useState('');
    const [area, setArea] = useState('');
    const [salesmanId, setSalesmanId] = useState('unassigned');
    const [outstandingBalance, setOutstandingBalance] = useState(0);
    const [deliveryFrequency, setDeliveryFrequency] = useState(1);
    const [emptyBottles, setEmptyBottles] = useState(0);
    const [autoAssignedSalesman, setAutoAssignedSalesman] = useState<number | null>(null);

    // Auto-assign salesman when area changes (only if not manually overridden)
    useEffect(() => {
        if (area.trim()) {
            const areaAssignment = areaAssignments.find(a => a.area === area.trim());
            if (areaAssignment && areaAssignment.salesmanId) {
                // Only auto-assign if no manual override or if current selection is unassigned
                if (!autoAssignedSalesman || salesmanId === 'unassigned') {
                    setSalesmanId(areaAssignment.salesmanId.toString());
                    setAutoAssignedSalesman(areaAssignment.salesmanId);
                }
            } else {
                // If area doesn't have assignment, reset to unassigned only if it was auto-assigned
                if (autoAssignedSalesman && salesmanId === autoAssignedSalesman.toString()) {
                    setSalesmanId('unassigned');
                    setAutoAssignedSalesman(null);
                }
            }
        } else {
            // If area is cleared, reset only if it was auto-assigned
            if (autoAssignedSalesman && salesmanId === autoAssignedSalesman.toString()) {
                setSalesmanId('unassigned');
                setAutoAssignedSalesman(null);
            }
        }
    }, [area, areaAssignments]);

    const resetForm = () => {
        setName('');
        setAddress('');
        setMobile('');
        setArea('');
        setSalesmanId('unassigned');
        setOutstandingBalance(0);
        setDeliveryFrequency(1);
        setEmptyBottles(0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCustomer: Omit<Customer, 'id' | 'salesmanAssignmentHistory'> = {
            name,
            address,
            mobile,
            area: area.trim(),
            salesmanId: salesmanId === 'unassigned' ? null : Number(salesmanId),
            totalBalance: outstandingBalance,
            totalBottlesPurchased: 0,
            deliveryFrequencyDays: deliveryFrequency,
            emptyBottlesHeld: emptyBottles,
            // FIX: Added missing 'lastEmptiesCollectionDate' property to satisfy the Customer type.
            lastEmptiesCollectionDate: null,
        };
        onAddCustomer(newCustomer);
        resetForm();
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-brand-text-primary">Add New Customer</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                        <input type="tel" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                        <textarea
                            placeholder="Full Address"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm md:col-span-2"
                        />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-brand-text-secondary mb-1">
                                Area/Sector
                                {onNavigateToAreaAssignment && (
                                    <button
                                        type="button"
                                        onClick={onNavigateToAreaAssignment}
                                        className="ml-2 text-xs text-brand-blue hover:text-brand-lightblue hover:underline"
                                    >
                                        (Manage Areas)
                                    </button>
                                )}
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={area}
                                    onChange={e => setArea(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                                >
                                    <option value="">Select Area</option>
                                    {areas.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Or enter new area"
                                    value={area}
                                    onChange={e => setArea(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-1">
                                Assigned Salesman
                                {autoAssignedSalesman && (
                                    <span className="ml-2 text-xs text-green-600 font-medium">
                                        (Auto-assigned from area)
                                    </span>
                                )}
                            </label>
                            <select 
                                value={salesmanId} 
                                onChange={e => {
                                    setSalesmanId(e.target.value);
                                    setAutoAssignedSalesman(null); // Clear auto-assigned flag when manually changed
                                }} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                            >
                                <option value="unassigned">Unassigned Salesman</option>
                                {salesmen.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {autoAssignedSalesman && (
                                <p className="mt-1 text-xs text-green-600">
                                    Salesman automatically assigned based on area assignment
                                </p>
                            )}
                        </div>
                        <input type="number" placeholder="Initial Outstanding Balance (PKR)" value={outstandingBalance} onChange={e => setOutstandingBalance(Number(e.target.value))} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                         <div>
                            <label htmlFor="deliveryFrequency" className="block text-xs font-medium text-brand-text-secondary mb-1">Delivery Frequency (Days)</label>
                            <input type="number" id="deliveryFrequency" value={deliveryFrequency} onChange={e => setDeliveryFrequency(Number(e.target.value))} required min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="emptyBottles" className="block text-xs font-medium text-brand-text-secondary mb-1">Initial Empty Bottles Held</label>
                            <input type="number" id="emptyBottles" value={emptyBottles} onChange={e => setEmptyBottles(Number(e.target.value))} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 text-brand-text-secondary rounded-md hover:bg-gray-200 font-semibold">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-lightblue font-semibold">Add Customer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerModal;