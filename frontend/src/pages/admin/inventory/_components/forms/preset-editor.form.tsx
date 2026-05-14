import { Separator } from "@/components/separator";
import { useUnitOfMeasureQuery } from "@/features/unit-of-measure/unit-of-measure";
import { createUnitPreset } from "@/features/unit-of-measure/create-unit-preset/create-unit-preset.service";
import { CreateUnitPresetPayload } from "@/features/unit-of-measure/create-unit-preset/create-unit-preset.model";
import { toast } from "sonner";
import { useState, useEffect, useId } from "react";
import { GripVertical, Info, Trash2 } from "lucide-react";
import { getNextPresetCode } from "@/features/unit-of-measure/get-next-preset-code/get-next-preset-code.service";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useUnitPresetQuery } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PresetEditorFormProps {
  handleCancelAddPreset: () => void;
  onOpenAddUnitModal: () => void;
}

type ConversionRow = {
  id: string;
  uomId: string;
  factor: string;
};

const MAX_CONVERSIONS = 4;

export const PresetEditorForm = ({
  handleCancelAddPreset,
  onOpenAddUnitModal,
}: PresetEditorFormProps) => {
  const { data: units = [] } = useUnitOfMeasureQuery();
  const { refetch: refetchPresets } = useUnitPresetQuery();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextCode, setNextCode] = useState("...");
  const [mainUnitId, setMainUnitId] = useState("");
  const [conversions, setConversions] = useState<ConversionRow[]>([
    { id: "conv-init", uomId: "", factor: "" },
  ]);
  const uid = useId();

  useEffect(() => {
    getNextPresetCode()
      .then((data) => setNextCode(data.next_Code))
      .catch(() => setNextCode("????"));
  }, []);

  const usedIds = [mainUnitId, ...conversions.map((c) => c.uomId)].filter(
    Boolean,
  );

  const availableFor = (currentValue: string) =>
    units.filter(
      (u) =>
        !usedIds.includes(String(u.uom_ID)) ||
        String(u.uom_ID) === currentValue,
    );

  const handleAddConversion = () => {
    if (conversions.length >= MAX_CONVERSIONS) return;
    setConversions((prev) => [
      ...prev,
      { id: `${uid}-${Date.now()}`, uomId: "", factor: "" },
    ]);
  };

  const handleRemoveConversion = (index: number) => {
    setConversions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConversionChange = (
    index: number,
    field: "uomId" | "factor",
    value: string,
  ) => {
    setConversions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(conversions);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setConversions(items);
  };

  const selectedMainUnit = units.find((u) => String(u.uom_ID) === mainUnitId);

  const handleSubmit = async () => {
    // if (!presetName.trim()) {
    //   toast.error("Preset name is required");
    //   return;
    // }
    if (!mainUnitId) {
      toast.error("Please select a main unit");
      return;
    }

    const validConversions = conversions.filter(
      (c) => c.uomId && c.factor !== "",
    );

    const levels: CreateUnitPresetPayload["levels"] = [
      { uom_ID: Number(mainUnitId), level: 1, conversion_Factor: 1 },
      ...validConversions.map((c, i) => ({
        uom_ID: Number(c.uomId),
        level: i + 2,
        conversion_Factor: Number(c.factor) || 1,
      })),
    ];

    const payload: CreateUnitPresetPayload = {
      main_Unit_ID: Number(mainUnitId),
      levels,
    };

    setIsSubmitting(true);
    try {
      const response = await createUnitPreset(payload);
      toast.success(
        response.message || "Packaging Preset Created Successfully",
      );
      await refetchPresets();
      handleCancelAddPreset();
    } catch (error: any) {
      toast.error(error?.response?.data || "Failed to create packaging preset");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Preset Code */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">
            Preset Code (Auto-generated)
          </label>
          <Info size={15} className="text-vesper-gray" />
        </div>
        <span className="self-start px-2 py-0.5 border-2 border-gray-300 rounded-md text-green-600 font-semibold bg-gray-100 text-sm">
          {nextCode}
        </span>
        <label className="text-vesper-gray text-xs">
          A unique code will be assigned when you create this preset.
        </label>
      </div>

      {/* <Separator orientation="horizontal" className="bg-vesper-gray/30" />

      
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">
          Preset Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Box-Pack-Piece"
          className="input-style-2"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
        />
      </div> */}

      <Separator orientation="horizontal" className="bg-vesper-gray/30" />

      {/* Main Unit */}
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">
          Main Unit<span className="text-red-500">*</span>
        </label>
        <Select
          value={mainUnitId}
          onValueChange={(newId) => {
            if (newId === "__add_new__") {
              onOpenAddUnitModal();
              return;
            }
            setConversions((prev) =>
              prev.map((c) => (c.uomId === newId ? { ...c, uomId: "" } : c)),
            );
            setMainUnitId(newId);
          }}
        >
          <SelectTrigger className="rounded-md p-2 border text-sm max-w-xs bg-white w-full">
            <SelectValue placeholder="Select Unit..." />
          </SelectTrigger>
          <SelectContent>
            {units
              .filter(
                (u) =>
                  !usedIds.includes(String(u.uom_ID)) ||
                  String(u.uom_ID) === mainUnitId,
              )
              .map((u) => (
                <SelectItem key={u.uom_ID} value={String(u.uom_ID)}>
                  {u.uom_Name}
                </SelectItem>
              ))}
            <SelectSeparator />
            <SelectItem value="__add_new__">
              <span className="text-river-green font-semibold">
                + Add New Unit
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <label className="text-xs text-vesper-gray">
          Select the main or largest unit for this packaging preset.
        </label>
      </div>

      <Separator orientation="horizontal" className="bg-vesper-gray/30" />

      {/* Conversion Chain */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <label className="font-semibold text-sm">Conversion Chain</label>
          <span className="text-xs text-vesper-gray">
            Define the conversion flow from the main unit down to the smallest
            unit. Conversions are optional — leave empty for a standalone
            preset.
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {/* Level 1 — static main unit */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-river-green text-white rounded-full flex items-center justify-center text-xs shrink-0 ml-1">
              1
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {selectedMainUnit ? (
                  selectedMainUnit.uom_Name
                ) : (
                  <span className="text-gray-400 italic">Main Unit</span>
                )}
              </span>
              <span className="text-xs text-vesper-gray">(Main Unit)</span>
            </div>
          </div>

          {/* Draggable conversion rows */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="conversions">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-1.5"
                >
                  {conversions.map((conv, idx) => (
                    <Draggable key={conv.id} draggableId={conv.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-2 rounded-md p-1 transition-colors ${
                            snapshot.isDragging ? "bg-blue-50 shadow-md" : ""
                          }`}
                        >
                          <div className="w-6 h-6 bg-river-green text-white rounded-full flex items-center justify-center text-xs shrink-0">
                            {idx + 2}
                          </div>

                          <span className="text-base text-gray-400 select-none font-mono">
                            └─
                          </span>

                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                          >
                            <GripVertical size={16} />
                          </div>

                          <Select
                            value={conv.uomId}
                            onValueChange={(value) => {
                              if (value === "__add_new__") {
                                onOpenAddUnitModal();
                                return;
                              }
                              handleConversionChange(idx, "uomId", value);
                            }}
                          >
                            <SelectTrigger className="rounded-md p-2 border text-sm max-w-xs bg-white w-full">
                              <SelectValue placeholder="Select Unit..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFor(conv.uomId).map((u) => (
                                <SelectItem
                                  key={u.uom_ID}
                                  value={String(u.uom_ID)}
                                >
                                  {u.uom_Name}
                                </SelectItem>
                              ))}
                              <SelectSeparator />
                              <SelectItem value="__add_new__">
                                <span className="text-river-green font-semibold">
                                  + Add New Unit
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <input
                            type="number"
                            min="1"
                            placeholder="Enter quantity..."
                            className="max-w-xs w-full shrink-0 rounded-md border p-2 text-sm drop-shadow-none shadow-none"
                            value={conv.factor}
                            onChange={(e) =>
                              handleConversionChange(
                                idx,
                                "factor",
                                e.target.value,
                              )
                            }
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveConversion(idx)}
                            className="p-2 rounded-md bg-red-50 border-2 border-red-200 hover:border-red-500 transition-colors shrink-0 w-fit"
                          >
                            <Trash2 size={15} className="text-red-500" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <button
          type="button"
          disabled={conversions.length >= MAX_CONVERSIONS}
          onClick={handleAddConversion}
          className="bg-white text-river-green border-2 border-river-green py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add Conversion
        </button>

        <div className="flex items-start gap-2">
          <Info size={15} className="text-vesper-gray mt-0.5 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-vesper-gray">
              Drag and drop to reorder conversions.
            </span>
            <span className="text-xs text-vesper-gray">
              You can add up to {MAX_CONVERSIONS} conversions (plus the main
              unit). Conversions are optional for standalone presets.
            </span>
          </div>
        </div>
      </div>

      {/* Add new unit shortcut */}
      {/* <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
        <span className="text-xs text-gray-600">
          Need a new unit that's not in the list?
        </span>
        <button
          type="button"
          onClick={onOpenAddUnitModal}
          className="text-xs font-semibold"
        >
          + Add New Unit
        </button>
      </div> */}

      <Separator orientation="horizontal" className="bg-vesper-gray/30" />

      {/* Footer */}
      <div className="flex justify-between gap-2">
        <button
          type="button"
          className="text-black bg-white border-2 border-vesper-gray max-w-fit py-2"
          onClick={handleCancelAddPreset}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="py-2 text-nowrap max-w-fit"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Confirm Packaging Preset"}
        </button>
      </div>
    </div>
  );
};
