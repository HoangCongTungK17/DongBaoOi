import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function useLeafletDefaultIcon() {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);
}

const MapOverview = ({ zones = [], sosRequests = [] }) => {
  useLeafletDefaultIcon();

  // TỐI ƯU: Tránh treo trang khi dữ liệu chưa tải xong
  if (!zones && !sosRequests) {
    return <div className="mt-3 h-[32rem] flex items-center justify-center bg-slate-900 text-slate-400 rounded-xl">Đang khởi tạo bản đồ...</div>;
  }

  return (
    <div className="mt-3 h-[32rem] w-full overflow-hidden rounded-xl border border-slate-800">
      <MapContainer 
        center={[14.0583, 108.2772]} 
        zoom={6} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CHÚ Ý: Tất cả các điểm Marker phải nằm bên trong MarkerClusterGroup */}
        <MarkerClusterGroup chunkedLoading>
          {/* Vẽ các vùng thiên tai */}
          {zones && zones.map((z) => (
            <React.Fragment key={`zone-${z.id}`}>
              <Marker position={[z.centerLatitude, z.centerLongitude]}>
                <Popup>
                  <div className="font-bold text-slate-900">{z.name}</div>
                  <div className="text-xs">Nguy hiểm: {z.dangerLevel}</div>
                </Popup>
              </Marker>
              <Circle 
                center={[z.centerLatitude, z.centerLongitude]} 
                radius={(z.radius || 0) * 1000} 
                pathOptions={{ color: z.dangerLevel === 'HIGH' ? 'red' : 'orange' }} 
              />
            </React.Fragment>
          ))}

          {/* Vẽ các yêu cầu SOS */}
          {sosRequests && sosRequests.map((sos) => (
            <Marker 
              key={`sos-${sos.id}`} 
              position={[sos.latitude, sos.longitude]}
            >
              <Popup>
                <div className="font-bold text-red-600">SOS: {sos.message || "Cần cứu trợ!"}</div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapOverview;