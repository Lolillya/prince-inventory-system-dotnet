import { SearchIcon } from "@/icons";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { FileSearch, X } from "lucide-react";
import { useMemo, useState } from "react";

interface QuotationGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: InventoryProductModel[];
}

type QuotationLineItem = {
    productId: number;
    description: string;
    uom: string;
    price: number | null;
};

const buildDescription = (item: InventoryProductModel) => {
    return `${item.product.product_Name}-${item.brand.brandName}-${item.variant.variant_Name}`;
};

const resolvePrimaryUom = (item: InventoryProductModel) => {
    const levels = [
        ...(item.unitPresets[0]?.preset?.presetLevels ?? []),
    ].sort((a, b) => a.level - b.level);

    if (levels.length > 0) {
        return levels[0].unitOfMeasure.uom_Name;
    }

    const fallbackUom = item.restockInfo?.[0]?.presetPricing?.[0]?.unitName;
    return fallbackUom || "-";
};

const resolvePrimaryPrice = (item: InventoryProductModel) => {
    const presetPrices = item.unitPresets
        .flatMap((preset) => preset.presetPricing ?? [])
        .sort((a, b) => a.level - b.level);

    if (presetPrices.length > 0) {
        return presetPrices[0].price_Per_Unit;
    }

    const restockPrice = item.restockInfo?.[0]?.base_Unit_Price;
    return typeof restockPrice === "number" ? restockPrice : null;
};

export const QuotationGeneratorModal = ({
    isOpen,
    onClose,
    inventory,
}: QuotationGeneratorModalProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [lineItems, setLineItems] = useState<QuotationLineItem[]>([]);

    const filteredInventory = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return inventory;

        return inventory.filter((item) => {
            return (
                item.product.product_Code.toLowerCase().includes(query) ||
                item.product.product_Name.toLowerCase().includes(query) ||
                item.product.description.toLowerCase().includes(query) ||
                item.brand.brandName.toLowerCase().includes(query) ||
                item.variant.variant_Name.toLowerCase().includes(query) ||
                item.category.category_Name.toLowerCase().includes(query)
            );
        });
    }, [inventory, searchQuery]);

    const selectedItemIds = useMemo(
        () => new Set(lineItems.map((item) => item.productId)),
        [lineItems],
    );

    const handleAddLineItem = (item: InventoryProductModel) => {
        if (selectedItemIds.has(item.product.product_ID)) return;

        const nextItem: QuotationLineItem = {
            productId: item.product.product_ID,
            description: buildDescription(item),
            uom: resolvePrimaryUom(item),
            price: resolvePrimaryPrice(item),
        };

        setLineItems((prev) => [...prev, nextItem]);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50 gap-3">
            <div className="w-7/12 h-4/5 bg-white px-5 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
                <div
                    className="absolute right-3 top-3 z-10 rounded-md text-vesper-gray hover:bg-bellflower-gray p-2 cursor-pointer transition"
                    onClick={onClose}
                    aria-label="Close quotation modal"
                >
                    <X size={18} />
                </div>

                <h1>Quotation</h1>

                <div className="flex items-center p-2 border-b">
                    <label className="text-sm font-semibold text-saltbox-gray w-full">
                        Description
                    </label>
                    <label className="text-sm font-semibold text-saltbox-gray w-1/3 text-left">
                        UOM
                    </label>
                    <label className="text-sm font-semibold text-saltbox-gray w-1/3 text-right">
                        Price
                    </label>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {lineItems.length === 0 ? (
                        <div className="text-saltbox-gray flex flex-col items-center justify-center gap-4 w-full h-full px-6">
                            <FileSearch size={120} strokeWidth={1.5} className="text-gray-400" />
                            <span className="text-sm font-medium text-vesper-gray">
                                No item listed yet.
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {lineItems.map((item, index) => (
                                <div
                                    key={item.productId}
                                    className={`py-3 px-3 flex justify-between gap-2 rounded-lg text-sm items-center ${index % 2 !== 0 ? "bg-custom-gray" : ""}`}
                                >
                                    <span className="w-full truncate">{item.description}</span>
                                    <span className="w-1/3">{item.uom}</span>
                                    <span className="w-1/3 text-right">
                                        {item.price === null ? "-" : item.price.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-lg py-10 px-5 flex flex-col gap-5 h-4/5 w-4/12">
                <div className="flex flex-col gap-5 flex-1 min-h-0">
                    <h3 className="font-bold">Add an Item</h3>

                    <div className="relative w-full">
                        <input
                            placeholder="Search..."
                            className="input-style-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <SearchIcon />
                        </i>
                    </div>

                    <div className="flex flex-col overflow-y-auto gap-2 border p-3 rounded-lg inset-shadow-sm flex-1 min-h-0">
                        {filteredInventory.map((item) => {
                            const isAdded = selectedItemIds.has(item.product.product_ID);
                            const primaryUom = resolvePrimaryUom(item);
                            const primaryPrice = resolvePrimaryPrice(item);
                            return (
                                <div
                                    key={item.product.product_ID}
                                    className="p-3 rounded-lg border bg-custom-gray flex items-center justify-between gap-2"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">
                                            {buildDescription(item)}
                                        </p>
                                        <p className="text-xs text-vesper-gray">
                                            {primaryUom}
                                            {" · "}
                                            {primaryPrice === null ? "No price" : primaryPrice.toFixed(2)}
                                        </p>
                                    </div>

                                    <button
                                        className="max-w-fit px-3 py-2 text-xs"
                                        onClick={() => handleAddLineItem(item)}
                                        disabled={isAdded}
                                    >
                                        {isAdded ? "Added" : "Add"}
                                    </button>
                                </div>
                            );
                        })}

                        {filteredInventory.length === 0 && (
                            <div className="text-center text-vesper-gray text-sm py-6">
                                No matching inventory items.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};