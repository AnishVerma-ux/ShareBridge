import { useState } from "react";
import { toast } from "react-toastify";

/** Uses browser geolocation, then reverse-geocodes with OpenStreetMap Nominatim. */
const LocationButton = ({ onAddress, label = "Use my current location" }) => {
  const [loading, setLoading] = useState(false);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support location access.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const coordinateAddress = `Coordinates: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}`;
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Reverse geocoding failed");
        const data = await response.json();
        onAddress(data.display_name || coordinateAddress);
        toast.success(data.display_name ? "Current address filled. Please verify it." : "Current coordinates filled. Please verify them.");
      } catch {
        onAddress(coordinateAddress);
        toast.info("Address lookup was unavailable; current coordinates were filled instead.");
      } finally {
        setLoading(false);
      }
    }, (error) => {
      setLoading(false);
      const message = error.code === error.PERMISSION_DENIED
        ? "Location permission was denied. Allow location access in your browser settings."
        : error.code === error.TIMEOUT
          ? "Location request timed out. Please try again."
          : "Could not determine your location. Check device location settings.";
      toast.error(message);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  };

  return (
    <button type="button" onClick={useCurrentLocation} disabled={loading}
      className="mt-2 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60">
      {loading ? "Finding location…" : `📍 ${label}`}
    </button>
  );
};

export default LocationButton;
