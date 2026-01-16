import { UnitPresetRestockPayload } from "./models/unit-preset-restock.model";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5055";

export const createUnitPresetRestock = async (
  payload: UnitPresetRestockPayload
) => {
  try {
    console.log("Sending restock payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/restock/unit-preset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to create restock");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating unit preset restock:", error);
    throw error;
  }
};

export const unitPresetRestockService = {
  create: createUnitPresetRestock,
};
