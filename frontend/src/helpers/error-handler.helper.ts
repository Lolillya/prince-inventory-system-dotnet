import axios from "axios";
import { toast } from "sonner";

export const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    var err = error.response;
    if (Array.isArray(err?.data)) {
      // ASP.NET Identity errors: [{ code, description }]
      for (let val of err?.data) {
        toast.error(val.description ?? JSON.stringify(val));
      }
    } else if (Array.isArray(err?.data.errors)) {
      for (let val of err?.data.errors) {
        toast.error(val.description);
      }
    } else if (typeof err?.data.errors === "object") {
      for (let e in err?.data.errors) {
        toast.error(err.data.errors[e][0]);
      }
    } else if (err?.data) {
      toast.error(
        typeof err.data === "string" ? err.data : JSON.stringify(err.data),
      );
    } else if (err?.status == 401) {
      toast.error("Please login");
      window.history.pushState({}, "LoginPage", "/login");
    } else if (err) {
      toast.error(err?.data);
    }
  }
};
