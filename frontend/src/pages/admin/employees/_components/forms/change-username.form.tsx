import { CheckUsernameAvailabilityService } from "@/features/employees/check-username-availability.service";
import { ChangeEmployeeUsernameService } from "@/features/employees/change-employee-username.service";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, User, XCircle } from "lucide-react";
import { Separator } from "@/components/separator";

interface ChangeUsernameFormProps {
  userId: string;
  currentUsername: string;
  setIsRecoverAccountModalOpen: Dispatch<SetStateAction<boolean>>;
}

type AvailabilityState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken"; reason?: string };

export const ChangeUsernameForm = ({
  userId,
  currentUsername,
  setIsRecoverAccountModalOpen,
}: ChangeUsernameFormProps) => {
  const queryClient = useQueryClient();
  const [newUsername, setNewUsername] = useState("");
  const [availability, setAvailability] = useState<AvailabilityState>({
    status: "idle",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const trimmed = newUsername.trim();

    if (!trimmed || trimmed === currentUsername) {
      setAvailability({ status: "idle" });
      return;
    }

    if (trimmed.length < 3) {
      setAvailability({
        status: "taken",
        reason: "Minimum of 3 characters",
      });
      return;
    }

    setAvailability({ status: "checking" });

    const timeout = setTimeout(async () => {
      try {
        const result = await CheckUsernameAvailabilityService(
          trimmed,
          userId,
        );
        setAvailability(
          result.available
            ? { status: "available" }
            : { status: "taken", reason: result.reason },
        );
      } catch {
        setAvailability({ status: "idle" });
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [newUsername, currentUsername, userId]);

  const canSubmit =
    availability.status === "available" && newUsername.trim().length >= 3;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await ChangeEmployeeUsernameService(userId, newUsername.trim());
      toast.success("Username changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      queryClient.invalidateQueries({ queryKey: ["employee-selected"] });
      queryClient.invalidateQueries({ queryKey: ["user-audit-logs", userId] });
      setIsRecoverAccountModalOpen(false);
    } catch {
      toast.error("Failed to change username. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* CURRENT USERNAME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Current Username</label>
        <div className="w-full bg-custom-gray p-2 rounded-lg flex items-center gap-2 text-gray-500">
          <User size={16} />
          <span>{currentUsername}</span>
        </div>
      </div>

      {/* NEW USERNAME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">New Username</label>
        <div className="relative">
          <input
            type="text"
            className="w-full drop-shadow-none bg-white border rounded-lg p-2 pr-10"
            placeholder="Enter new username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            {availability.status === "checking" ? (
              <span className="text-xs">...</span>
            ) : (
              <User size={16} />
            )}
          </div>
        </div>

        {availability.status === "available" && (
          <span className="flex items-center gap-1 text-green-600 text-xs">
            <CheckCircle2 size={14} />
            Username available
          </span>
        )}
        {availability.status === "taken" && (
          <span className="flex items-center gap-1 text-red-500 text-xs">
            <XCircle size={14} />
            {availability.reason ?? "Username already exists"}
          </span>
        )}
      </div>

      <ul className="list-disc ml-4">
        <li className="text-vesper-gray text-xs">Minimum of 3 characters</li>
        <li className="text-vesper-gray text-xs">
          Changing the username will affect the employee's ability to log in.
        </li>
      </ul>

      <Separator orientation="horizontal" />

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          onClick={() => setIsRecoverAccountModalOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Saving..." : "Update Username"}
        </button>
      </div>
    </div>
  );
};
