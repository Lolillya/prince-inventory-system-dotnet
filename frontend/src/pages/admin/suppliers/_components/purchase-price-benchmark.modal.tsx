import { XIcon, SearchIcon } from "@/icons";
import { useState } from "react";
import { Scale } from "lucide-react";

interface PurchasePriceBenchmarkModalProps {
    onClose: () => void;
}

export const PurchasePriceBenchmarkModal = ({
    onClose,
}: PurchasePriceBenchmarkModalProps) => {
    // Phase 1: Toggle states for Product 1 and Product 2
    const [isProduct1Open, setIsProduct1Open] = useState(false);
    const [isProduct2Open, setIsProduct2Open] = useState(false);

    // Phase 3: Selection state and toggles for detail panel
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [expandedSuppliers, setExpandedSuppliers] = useState<Record<string, boolean>>({});
    const [editingSupplier, setEditingSupplier] = useState<string | null>(null);

    const toggleSupplier = (supplierId: string) => {
        setExpandedSuppliers(prev => ({ ...prev, [supplierId]: !prev[supplierId] }));
    };

    return (
        <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
            <div className={`transition-all duration-300 ${selectedPreset ? 'w-[1200px]' : 'w-[800px]'} h-[90vh] overflow-hidden bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4`}>
                <div>
                    <div className="absolute top-4 right-4 cursor-pointer" onClick={onClose}>
                        <XIcon />
                    </div>
                    <div className="w-full">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Purchase Price Benchmark
                        </h1>
                    </div>
                </div>

                <div className="flex gap-6 h-full min-h-0 overflow-hidden">
                    {/* Left Panel */}
                    <div className={`flex flex-col gap-4 transition-all duration-300 ${selectedPreset ? 'w-1/2' : 'w-full'} h-full overflow-hidden`}>
                        {/* Search Bar */}
                        <div className="flex bg-white items-center gap-2 px-3 py-2 border-2 border-black flex-shrink-0">
                            <SearchIcon />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full outline-none text-sm bg-transparent font-medium"
                            />
                        </div>

                        {/* Legend */}
                        <div className="flex gap-6 items-center text-sm flex-shrink-0">
                            <span className="text-red-500 font-medium">Legend :</span>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="text-red-500 font-medium">All Set Purchase Price are Profitable</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-600"></span>
                                <span className="text-red-500 font-medium">Atleast 1 Purchase Price at a Loss</span>
                            </div>
                        </div>

                        {/* Product List Container */}
                        <div className="flex flex-col gap-4 mt-2 overflow-y-auto pb-4 custom-scrollbar">

                            {/* Card 1 */}
                            <div className="flex flex-col border-2 border-black p-3 bg-white">
                                <h2 className="font-bold text-lg">Item - Brand - Variant</h2>

                                <div className="mt-2 text-sm flex flex-col gap-2">
                                    {/* Toggle 1 */}
                                    <div>
                                        <div
                                            className="flex items-center gap-2 cursor-pointer w-max"
                                            onClick={() => setIsProduct1Open(!isProduct1Open)}
                                        >
                                            <span className="text-black text-xs transition-transform duration-200" style={{ transform: isProduct1Open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                                ▶
                                            </span>
                                            <span className="text-base">Primary Unit : <span className="text-red-500">Box</span></span>
                                        </div>

                                        {/* Presets - Phase 2 */}
                                        {isProduct1Open && (
                                            <div className="flex flex-col mt-2 pl-6 gap-2">
                                                {/* Row 1 */}
                                                <div
                                                    className={`flex items-center gap-6 sm:gap-16 cursor-pointer hover:bg-gray-100 p-1 w-max rounded ${selectedPreset === 'Box > Pack (x10) > Piece (x20)' ? 'bg-gray-100' : ''}`}
                                                    onClick={() => setSelectedPreset('Box > Pack (x10) > Piece (x20)')}
                                                >
                                                    <span className="font-bold text-black text-sm w-48">Box &gt; Pack (x10) &gt; Piece (x20)</span>
                                                    <div className="flex items-center gap-8">
                                                        <span className="font-medium text-sm">2 suppliers</span>
                                                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                                    </div>
                                                </div>
                                                {/* Row 2 */}
                                                <div
                                                    className={`flex items-center gap-6 sm:gap-16 cursor-pointer hover:bg-gray-100 p-1 w-max rounded ${selectedPreset === 'Box > Set (x15) > Piece (x25)' ? 'bg-gray-100' : ''}`}
                                                    onClick={() => setSelectedPreset('Box > Set (x15) > Piece (x25)')}
                                                >
                                                    <span className="font-bold text-black text-sm w-48">Box &gt; Set (x15) &gt; Piece (x25)</span>
                                                    <div className="flex items-center gap-8">
                                                        <span className="font-medium text-sm">3 suppliers</span>
                                                        <span className="w-3 h-3 rounded-full bg-red-600"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Toggle 2 */}
                                    <div className="mt-2">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer w-max"
                                            onClick={() => setIsProduct2Open(!isProduct2Open)}
                                        >
                                            <span className="text-black text-xs transition-transform duration-200" style={{ transform: isProduct2Open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                                ▶
                                            </span>
                                            <span className="text-base">Primary Unit : <span className="text-red-500">Pack</span></span>
                                        </div>
                                        {/* Presets - Phase 2 */}
                                        {isProduct2Open && (
                                            <div className="flex flex-col mt-2 pl-6 gap-2">
                                                <div
                                                    className={`flex items-center gap-6 sm:gap-16 cursor-pointer hover:bg-gray-100 p-1 w-max rounded ${selectedPreset === 'Pack > Piece (x10)' ? 'bg-gray-100' : ''}`}
                                                    onClick={() => setSelectedPreset('Pack > Piece (x10)')}
                                                >
                                                    <span className="font-bold text-black text-sm w-48">Pack &gt; Piece (x10)</span>
                                                    <div className="flex items-center gap-8">
                                                        <span className="font-medium text-sm">1 suppliers</span>
                                                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="flex flex-col border-2 border-black p-3 bg-white mt-1 flex-shrink-0">
                                <h2 className="font-bold text-lg">Item1 - Brand1 - Variant1</h2>

                                <div className="mt-2 text-sm flex flex-col gap-2">
                                    <div className="flex items-center gap-2 cursor-pointer w-max">
                                        <span className="text-black text-xs transition-transform duration-200">
                                            ▶
                                        </span>
                                        <span className="text-base">Primary Unit : <span className="text-red-500">Pallet</span></span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Panel - Phase 3 */}
                    {selectedPreset && (
                        <div className="w-1/2 flex flex-col h-full pl-6 border-l border-gray-300 overflow-y-auto custom-scrollbar pr-2">
                            {/* Header Info */}
                            <div className="flex flex-col border-2 border-black p-3 bg-white flex-shrink-0 mb-4">
                                <h2 className="font-bold text-lg">Item - Brand - Variant</h2>
                                <span className="text-sm mt-1">Primary Unit <span className="text-red-500">: Box</span></span>
                                <span className="font-medium text-sm mt-1">{selectedPreset}</span>
                            </div>

                            {/* Data Table */}
                            <div className="w-full text-left text-sm border-t-2 border-b-2 border-black">
                                <div className="flex items-center font-bold border-b border-black py-2 pl-4">
                                    <div className="w-1/4">Supplier</div>
                                    <div className="w-1/4 text-center">Purchase Price (<span className="text-red-500">Box</span>)</div>
                                    <div className="w-1/4 text-center">Last Update</div>
                                    <div className="w-1/4 text-center">Profit/Loss</div>
                                </div>

                                {/* Supplier A */}
                                <div className="flex flex-col border-b border-gray-200 last:border-0 hover:bg-gray-50/50">
                                    <div className="flex items-center py-3 pl-4">
                                        <div className="w-1/4 font-medium">Supplier A</div>
                                        <div className="w-1/4 text-center font-medium">
                                            {editingSupplier === 'supplier-a' ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-gray-500 text-xs">PHP</span>
                                                    <input type="text" defaultValue="90.00" className="w-16 border border-gray-400 rounded px-1 outline-none text-center" />
                                                </div>
                                            ) : (
                                                "90.00"
                                            )}
                                        </div>
                                        <div className="w-1/4 text-center text-gray-600">12/05/26</div>
                                        <div className="w-1/4 flex items-center justify-center gap-3">
                                            <span className="w-3 h-3 rounded-full bg-green-500" title="Profit"></span>
                                            {editingSupplier === 'supplier-a' ? (
                                                <div className="flex gap-2">
                                                    <span className="text-xs text-green-600 cursor-pointer hover:underline font-bold" onClick={() => setEditingSupplier(null)}>Save</span>
                                                    <span className="text-xs text-red-500 cursor-pointer hover:underline font-bold" onClick={() => setEditingSupplier(null)}>Cancel</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => setEditingSupplier('supplier-a')}>Modify Price</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Expandable Details */}
                                    <div className="w-full pl-4 pb-2">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer w-max mt-1"
                                            onClick={() => toggleSupplier('supplier-a')}
                                        >
                                            <span className="text-black text-[10px] transition-transform duration-200" style={{ transform: expandedSuppliers['supplier-a'] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                                ▶
                                            </span>
                                            <span className="font-bold text-sm">View Details</span>
                                        </div>
                                        {expandedSuppliers['supplier-a'] && (
                                            <div className="pl-6 mt-3 text-xs flex gap-12">
                                                <div className="flex flex-col gap-4">
                                                    {/* Sub-unit Purchase Prices */}
                                                    <div>
                                                        <span className="font-bold text-black border-b border-gray-300 pb-1 pr-6">Sub-unit Purchase Prices</span>
                                                        <div className="flex flex-col gap-1 mt-2 font-medium text-gray-700">
                                                            <div className="flex items-center">
                                                                <span className="w-32">└─ Pack (x10)</span>
                                                                <span>PHP 9.00</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-32 pl-4">└─ Piece (x20)</span>
                                                                <span>PHP 0.45</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-4">
                                                    {/* Selling Prices */}
                                                    <div>
                                                        <span className="font-bold text-black border-b border-gray-300 pb-1 pr-6">Selling Prices (Global)</span>
                                                        <div className="flex flex-col gap-1 mt-2 font-medium text-gray-700">
                                                            <div className="flex items-center">
                                                                <span className="w-24">Box</span>
                                                                <span>PHP 120.00</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-24">Pack</span>
                                                                <span>PHP 15.00</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-24">Piece</span>
                                                                <span>PHP 1.00</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price History */}
                                                    <div>
                                                        <span className="font-bold text-black border-b border-gray-300 pb-1 pr-6">Price History</span>
                                                        <ul className="list-disc flex flex-col gap-1 mt-2 pl-4 text-gray-600">
                                                            <li>Jan 12, 2026 – Box PHP 95.00 <span className="text-gray-400">→</span> PHP 90.00</li>
                                                            <li>Dec 03, 2025 – Box PHP 100.00 <span className="text-gray-400">→</span> PHP 95.00</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Supplier B */}
                                <div className="flex flex-col border-b border-gray-200 last:border-0 hover:bg-gray-50/50">
                                    <div className="flex items-center py-3 pl-4">
                                        <div className="w-1/4 font-medium">Supplier B</div>
                                        <div className="w-1/4 text-center font-medium">
                                            {editingSupplier === 'supplier-b' ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-gray-500 text-xs">PHP</span>
                                                    <input type="text" defaultValue="120.00" className="w-16 border border-gray-400 rounded px-1 outline-none text-center" />
                                                </div>
                                            ) : (
                                                "120.00"
                                            )}
                                        </div>
                                        <div className="w-1/4 text-center text-gray-600">11/20/26</div>
                                        <div className="w-1/4 flex items-center justify-center gap-3">
                                            <span className="w-3 h-3 rounded-full bg-red-600" title="Loss"></span>
                                            {editingSupplier === 'supplier-b' ? (
                                                <div className="flex gap-2">
                                                    <span className="text-xs text-green-600 cursor-pointer hover:underline font-bold" onClick={() => setEditingSupplier(null)}>Save</span>
                                                    <span className="text-xs text-red-500 cursor-pointer hover:underline font-bold" onClick={() => setEditingSupplier(null)}>Cancel</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => setEditingSupplier('supplier-b')}>Modify Price</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Expandable Details */}
                                    <div className="w-full pl-4 pb-2">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer w-max mt-1"
                                            onClick={() => toggleSupplier('supplier-b')}
                                        >
                                            <span className="text-black text-[10px] transition-transform duration-200" style={{ transform: expandedSuppliers['supplier-b'] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                                ▶
                                            </span>
                                            <span className="font-bold text-sm">View Details</span>
                                        </div>
                                        {expandedSuppliers['supplier-b'] && (
                                            <div className="pl-6 mt-3 text-xs flex gap-12">
                                                <div className="flex flex-col gap-4">
                                                    {/* Sub-unit Purchase Prices */}
                                                    <div>
                                                        <span className="font-bold text-black border-b border-gray-300 pb-1 pr-6">Sub-unit Purchase Prices</span>
                                                        <div className="flex flex-col gap-1 mt-2 font-medium text-gray-700">
                                                            <div className="flex items-center">
                                                                <span className="w-32">└─ Pack (x10)</span>
                                                                <span>PHP 12.00</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-32 pl-4">└─ Piece (x20)</span>
                                                                <span>PHP 0.60</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-4">
                                                    {/* Selling Prices */}
                                                    <div>
                                                        <span className="font-bold text-black border-b border-gray-300 pb-1 pr-6">Selling Prices (Global)</span>
                                                        <div className="flex flex-col gap-1 mt-2 font-medium text-gray-700">
                                                            <div className="flex items-center">
                                                                <span className="w-24">Box</span>
                                                                <span>PHP 120.00</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-24">Pack</span>
                                                                <span>PHP 15.00</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-24">Piece</span>
                                                                <span>PHP 1.00</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price History */}
                                                    <div>
                                                        <span className="font-bold text-black border-b border-gray-300 pb-1 pr-6">Price History</span>
                                                        <ul className="list-disc flex flex-col gap-1 mt-2 pl-4 text-gray-600">
                                                            <li>Nov 20, 2026 – Box PHP 110.00 <span className="text-gray-400">→</span> PHP 120.00</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};