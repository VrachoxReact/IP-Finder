import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in production build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const IPAddressFinder = () => {
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIpData = async () => {
      try {
        // Using ipapi.co for more accurate geolocation data
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
          throw new Error("Failed to fetch IP data");
        }
        const data = await response.json();
        setIpData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIpData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        IP Address Finder
      </h1>
      {ipData && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="IP Address" value={ipData.ip} />
            <InfoItem
              label="Location"
              value={`${ipData.city}, ${ipData.region}, ${ipData.country_name}`}
            />
            <InfoItem label="ISP" value={ipData.org} />
            <InfoItem
              label="Coordinates"
              value={`${ipData.latitude}, ${ipData.longitude}`}
            />
            <InfoItem
              label="Accuracy Radius"
              value={`~${ipData.latitude_accuracy || 100} km`}
            />
          </div>
        </div>
      )}
      {ipData && ipData.latitude && ipData.longitude && (
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-md">
          <MapContainer
            center={[ipData.latitude, ipData.longitude]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[ipData.latitude, ipData.longitude]}>
              <Popup>Your approximate location</Popup>
            </Marker>
            <Circle
              center={[ipData.latitude, ipData.longitude]}
              radius={ipData.latitude_accuracy * 1000 || 100000}
              fillColor="#3388ff"
              fillOpacity={0.2}
              stroke={false}
            />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => {
  InfoItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  return (
    <div className="mb-2">
      <span className="font-semibold text-gray-700">{label}:</span>
      <span className="ml-2 text-gray-600">{value}</span>
    </div>
  );
};

export default IPAddressFinder;
