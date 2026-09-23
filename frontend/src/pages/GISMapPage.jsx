import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/common/Badge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Layers,
  MapPin,
  Search,
  Filter,
  Info,
  Maximize2,
  TreePine,
  Home,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  X,
  Calculator,
  ExternalLink,
  RotateCcw,
  Globe2,
  SlidersHorizontal,
  ChevronRight,
  Landmark,
  Building2,
  FileText,
  BadgeCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

// 8 Statutory Acquisition Statuses
const STATUTORY_STATUSES = [
  'Proposed',
  'Under Verification',
  'Notification Issued',
  'Awarded',
  'Compensation Paid',
  'Possession Taken',
  'R&R Pending',
  'Completed'
];

// Official Statutory Color Palette
const STATUS_COLORS = {
  'Proposed': { color: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-300' },
  'Under Verification': { color: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-300' },
  'Notification Issued': { color: '#8b5cf6', bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-300' },
  'Awarded': { color: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-800', border: 'border-amber-300' },
  'Compensation Paid': { color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300' },
  'Possession Taken': { color: '#059669', bg: 'bg-green-600', text: 'text-green-800', border: 'border-green-400' },
  'R&R Pending': { color: '#e11d48', bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-300' },
  'Completed': { color: '#047857', bg: 'bg-teal-700', text: 'text-teal-800', border: 'border-teal-400' }
};

const STATE_COORDINATES = {
  'Maharashtra': { center: [19.345, 73.125], zoom: 12 },
  'Gujarat': { center: [21.082, 72.882], zoom: 12 },
  'Uttar Pradesh': { center: [25.562, 81.822], zoom: 12 },
  'Tamil Nadu': { center: [13.312, 80.322], zoom: 12 },
  'Karnataka': { center: [16.322, 75.482], zoom: 12 },
  'Andhra Pradesh': { center: [15.683, 78.213], zoom: 12 },
  'Odisha': { center: [21.452, 87.012], zoom: 12 },
  'Bihar': { center: [25.591, 85.121], zoom: 12 },
  'Rajasthan': { center: [26.655, 71.185], zoom: 12 },
  'Madhya Pradesh': { center: [24.625, 79.825], zoom: 12 }
};

const INDIA_CENTER = [22.5937, 78.9629];
const INDIA_ZOOM = 5;

export default function GISMapPage({ setSelectedParcelForCalc }) {
  const navigate = useNavigate();

  // Map DOM & Leaflet References
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const projectMarkersLayerRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const currentTileLayerRef = useRef(null);

  // Data States
  const [mapData, setMapData] = useState(null);
  const [statistics, setStatistics] = useState({
    totalParcels: 0,
    proposed: 0,
    underVerification: 0,
    notificationIssued: 0,
    awarded: 0,
    compensationPaid: 0,
    possessionTaken: 0,
    rrPending: 0,
    completed: 0,
    acquired: 0,
    compensationCompleted: 0,
    possessionCompleted: 0,
    totalAreaHectares: 0
  });
  const [projectMarkers, setProjectMarkers] = useState([]);
  const [allParcelsList, setAllParcelsList] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState('street'); // 'street' | 'satellite'
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Available Filter Options (Computed dynamically)
  const [availableStates, setAvailableStates] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);

  // Fetch GIS Map Data from Backend
  const fetchGISData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedState !== 'ALL') params.state = selectedState;
      if (selectedDistrict !== 'ALL') params.district = selectedDistrict;
      if (selectedProjectId !== 'ALL') params.projectId = selectedProjectId;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/gis/map-data', { params });
      if (res.success) {
        setMapData(res);
        if (res.statistics) setStatistics(res.statistics);
        if (res.projectMarkers) setProjectMarkers(res.projectMarkers);

        // Extract list of parcels from GeoJSON features
        const features = res.parcels?.features || [];
        const parcels = features.map(f => ({
          ...f.properties,
          geometry: f.geometry
        }));
        setAllParcelsList(parcels);

        // Update layers on Leaflet map
        if (mapInstanceRef.current) {
          updateMapLayers(res.projectMarkers || [], res.parcels);
        }

        // If a previously selected parcel is still in results, keep it, else clear or keep first
        if (selectedParcel) {
          const stillThere = parcels.find(p => p.parcelId === selectedParcel.parcelId);
          if (stillThere) {
            setSelectedParcel(stillThere);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load GIS Map data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Populate Filter Options Once on Initial Mount
  useEffect(() => {
    const fetchInitialOptions = async () => {
      try {
        const res = await api.get('/gis/map-data');
        if (res.success && res.projectMarkers) {
          const states = [...new Set(res.projectMarkers.map(m => m.state))].filter(Boolean).sort();
          setAvailableStates(states);

          const projs = res.projectMarkers.map(m => ({
            id: m.projectId,
            name: m.projectName,
            state: m.state,
            district: m.district,
            sector: m.projectType
          }));
          setAvailableProjects(projs);
        }
      } catch (e) {
        console.error('Failed to fetch initial options:', e);
      }
    };
    fetchInitialOptions();
  }, []);

  // Update Available Districts when selectedState changes
  useEffect(() => {
    if (selectedState === 'ALL') {
      const dists = [...new Set(projectMarkers.map(m => m.district))].filter(Boolean).sort();
      setAvailableDistricts(dists);
      setSelectedDistrict('ALL');
    } else {
      const dists = [
        ...new Set(
          projectMarkers
            .filter(m => m.state === selectedState)
            .map(m => m.district)
        )
      ].filter(Boolean).sort();
      setAvailableDistricts(dists);
      if (!dists.includes(selectedDistrict)) {
        setSelectedDistrict('ALL');
      }
    }
  }, [selectedState, projectMarkers]);

  // Trigger Data Fetch when filters change
  useEffect(() => {
    fetchGISData();
  }, [selectedState, selectedDistrict, selectedProjectId, selectedStatus]);

  // Search Submit Handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGISData();
  };

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedProjectId('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setSelectedParcel(null);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INDIA_CENTER, INDIA_ZOOM, { duration: 1.2 });
    }
  };

  // Fly to India Center
  const handleFullIndiaView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INDIA_CENTER, INDIA_ZOOM, { duration: 1.2 });
    }
  };

  // Initialize Leaflet Map Container
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: INDIA_CENTER,
        zoom: INDIA_ZOOM,
        zoomControl: true,
        attributionControl: true
      });

      // Default OpenStreetMap Layer
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | PM GatiShakti BhoomiSetu Spatial Core',
        maxZoom: 19
      });
      streetLayer.addTo(map);
      currentTileLayerRef.current = streetLayer;

      // Layer Groups for Projects & GeoJSON
      projectMarkersLayerRef.current = L.layerGroup().addTo(map);
      geoJsonLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size once rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Map Type Toggle (Street vs Satellite)
  const toggleMapLayer = (type) => {
    setMapType(type);
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    if (type === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; PM GatiShakti High-Res Ortho Imagery',
          maxZoom: 19
        }
      );
      satLayer.addTo(map);
      currentTileLayerRef.current = satLayer;
    } else {
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | PM GatiShakti BhoomiSetu Spatial Core',
        maxZoom: 19
      });
      streetLayer.addTo(map);
      currentTileLayerRef.current = streetLayer;
    }
  };

  // Create Project Custom Marker Icon
  const createProjectDivIcon = (project) => {
    return L.divIcon({
      className: 'custom-project-pin',
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background: #0f2942;
          color: #ffffff;
          border: 2.5px solid #f58220;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          cursor: pointer;
          font-family: sans-serif;
          font-weight: 900;
          font-size: 13px;
          position: relative;
          transition: transform 0.2s ease;
        ">
          <span style="color: #f58220; font-size: 14px;">★</span>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 7px solid #0f2942;
          "></div>
        </div>
      `,
      iconSize: [34, 40],
      iconAnchor: [17, 40],
      popupAnchor: [0, -42]
    });
  };

  // Generate Rich Popup HTML for Land Parcel
  const createParcelPopupHtml = (props) => {
    const statusConfig = STATUS_COLORS[props.acquisitionStatus] || { color: '#3b82f6', bg: 'bg-blue-500' };
    const compensationDisbursed = props.compensation?.status === 'Disbursed' || props.acquisitionStatus === 'Compensation Paid' || props.acquisitionStatus === 'Completed';
    const possessionTaken = props.possession?.status === 'Taken' || props.acquisitionStatus === 'Possession Taken' || props.acquisitionStatus === 'Completed';

    return `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; width: 320px; color: #1e293b;">
        <!-- Header -->
        <div style="background: #0f2942; padding: 12px 14px; border-bottom: 3px solid #f58220; color: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; color: #cbd5e1;">
              Cadastral RoR Record
            </span>
            <span style="
              display: inline-block;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 8px;
              border-radius: 9999px;
              background-color: ${statusConfig.color};
              color: #ffffff;
            ">
              ${props.acquisitionStatus}
            </span>
          </div>
          <div style="font-size: 15px; font-weight: 900; letter-spacing: -0.01em;">
            Khasra ${props.surveyNumber || props.khasraNumber}
          </div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">
            ID: ${props.parcelId}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 12px 14px; font-size: 12px; line-height: 1.5; background: #ffffff;">
          <!-- Project Banner -->
          <div style="margin-bottom: 10px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b;">Infrastructure Corridor</div>
            <div style="font-weight: 700; color: #0f2942; font-size: 11px;">${props.project?.name || 'Corridor Alignment'}</div>
          </div>

          <!-- Location & Area Metrics -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 10px; color: #64748b;">Village & Tehsil</div>
              <div style="font-weight: 700; color: #1e293b;">${props.village} (${props.tehsil})</div>
            </div>
            <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 10px; color: #64748b;">District, State</div>
              <div style="font-weight: 700; color: #1e293b;">${props.district}, ${props.state}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: #fef3c7; border: 1px solid #fde68a; padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 10px; color: #92400e; font-weight: 700;">Target Land Area</div>
              <div style="font-weight: 900; color: #78350f; font-size: 13px;">${props.area || props.acquiredAreaHectares} Hectares</div>
            </div>
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 10px; color: #065f46; font-weight: 700;">PFMS Valuation</div>
              <div style="font-weight: 800; color: #047857;">₹${(props.compensation?.amount || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <!-- Statutory Status Row -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-bottom: 10px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">DBT Compensation:</span>
              <span style="font-weight: 700; color: ${compensationDisbursed ? '#059669' : '#d97706'};">
                ${props.compensation?.status || 'Assessed / In Process'}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">Possession:</span>
              <span style="font-weight: 700; color: ${possessionTaken ? '#059669' : '#64748b'};">
                ${props.possession?.status || 'Pending Handover'}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Affected Family (PAF):</span>
              <span style="font-weight: 700; color: #0f2942;">
                ${props.affectedFamilyReference?.familyId || props.owners?.[0]?.name || 'Enrolled'}
              </span>
            </div>
          </div>

          <!-- Cadastral Disclaimer Banner -->
          <div style="
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
            padding: 6px 8px;
            border-radius: 4px;
            font-size: 9.5px;
            color: #b45309;
            line-height: 1.3;
            margin-bottom: 10px;
          ">
            <strong>PM GatiShakti Disclaimer:</strong> Simulated spatial boundaries for corridor alignment tracking. Not certified cadastral RoR boundaries under State Land Records Acts.
          </div>

          <!-- Action Button -->
          <button
            onclick="window.bhoomiSetuInspectParcel('${props.parcelId}')"
            style="
              width: 100%;
              padding: 8px 12px;
              background: #0f2942;
              color: #ffffff;
              border: none;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            "
          >
            <span>Inspect Statutory Dossier</span>
            <span style="color: #f58220;">→</span>
          </button>
        </div>
      </div>
    `;
  };

  // Expose Global Handler for Popup Button
  useEffect(() => {
    window.bhoomiSetuInspectParcel = (parcelId) => {
      const found = allParcelsList.find(p => p.parcelId === parcelId);
      if (found) {
        setSelectedParcel(found);
      }
    };
    return () => {
      delete window.bhoomiSetuInspectParcel;
    };
  }, [allParcelsList]);

  // Render & Update Leaflet Layers (Project Markers + GeoJSON Polygons)
  const updateMapLayers = (markers, geoJsonFeatureCollection) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // 1. Clear existing layers
    if (projectMarkersLayerRef.current) {
      projectMarkersLayerRef.current.clearLayers();
    }
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.clearLayers();
    }

    // 2. Add Project Location Markers
    if (markers && markers.length > 0) {
      markers.forEach(proj => {
        if (!proj.latitude || !proj.longitude) return;

        const marker = L.marker([proj.latitude, proj.longitude], {
          icon: createProjectDivIcon(proj),
          title: proj.projectName
        });

        // Tooltip
        marker.bindTooltip(
          `<strong>${proj.projectName}</strong><br/><span style="color:#f58220; font-weight:bold;">${proj.projectType}</span> • ${proj.district}, ${proj.state}`,
          { sticky: true, className: 'cadastral-tooltip' }
        );

        // Project Popup
        const projPopupHtml = `
          <div style="font-family: ui-sans-serif, system-ui, sans-serif; width: 280px; padding: 12px; color: #0f2942;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #f58220;">
              Infrastructure Corridor Anchor
            </div>
            <div style="font-size: 13px; font-weight: 900; margin-top: 2px;">
              ${proj.projectName}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
              ${proj.ministry || 'Ministry of Infrastructure'}
            </div>
            <div style="margin-top: 8px; padding: 6px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color:#64748b;">Required Land:</span>
                <span style="font-weight: 700;">${proj.requiredLandArea || 0} Ha</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 2px;">
                <span style="color:#64748b;">Acquired Land:</span>
                <span style="font-weight: 700; color: #059669;">${proj.acquiredLandArea || 0} Ha</span>
              </div>
            </div>
            <button
              onclick="window.bhoomiSetuFilterProject('${proj.projectId}')"
              style="
                margin-top: 8px;
                width: 100%;
                padding: 6px 10px;
                background: #0f2942;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 700;
                cursor: pointer;
              "
            >
              Filter Map to This Project
            </button>
          </div>
        `;
        marker.bindPopup(projPopupHtml);

        marker.on('click', () => {
          map.flyTo([proj.latitude, proj.longitude], 12, { duration: 1 });
        });

        projectMarkersLayerRef.current.addLayer(marker);
      });
    }

    // Expose Project filter trigger from popup
    window.bhoomiSetuFilterProject = (projId) => {
      setSelectedProjectId(projId);
      map.closePopup();
    };

    // 3. Add GeoJSON Parcel Polygons
    if (geoJsonFeatureCollection && geoJsonFeatureCollection.features && geoJsonFeatureCollection.features.length > 0) {
      const geoLayer = L.geoJSON(geoJsonFeatureCollection, {
        style: (feature) => {
          const status = feature.properties.acquisitionStatus;
          const statusCfg = STATUS_COLORS[status] || { color: '#3b82f6' };
          return {
            fillColor: statusCfg.color,
            weight: 2,
            opacity: 0.95,
            color: '#0f2942',
            dashArray: '2',
            fillOpacity: 0.6
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties;

          // Tooltip hover
          layer.bindTooltip(
            `<strong>Khasra: ${p.surveyNumber || p.khasraNumber}</strong><br/>Village: ${p.village}<br/>Area: ${p.area || p.acquiredAreaHectares} Ha<br/><span style="color:#f58220; font-weight:bold;">${p.acquisitionStatus}</span>`,
            { sticky: true, className: 'cadastral-tooltip' }
          );

          // Popup click
          layer.bindPopup(createParcelPopupHtml(p), {
            maxWidth: 340,
            className: 'cadastral-popup'
          });

          layer.on({
            click: () => {
              setSelectedParcel(p);
              layer.setStyle({
                weight: 4,
                color: '#f58220',
                fillOpacity: 0.85
              });
            },
            mouseover: (e) => {
              const l = e.target;
              l.setStyle({ fillOpacity: 0.8, weight: 3 });
            },
            mouseout: (e) => {
              geoLayer.resetStyle(e.target);
            }
          });
        }
      });

      geoJsonLayerRef.current.addLayer(geoLayer);

      // Auto-fit bounds if a specific state or project is selected
      if (selectedState !== 'ALL' || selectedProjectId !== 'ALL') {
        try {
          const bounds = geoLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
          }
        } catch (e) {
          // bounds fallback
        }
      }
    }
  };

  // Fly to Parcel Location when Selected from List or Search
  const handleSelectParcel = (parcel) => {
    setSelectedParcel(parcel);
    if (!mapInstanceRef.current) return;

    if (parcel.latitude && parcel.longitude) {
      mapInstanceRef.current.flyTo([parcel.latitude, parcel.longitude], 15, { duration: 1.2 });
    } else if (parcel.centroid) {
      mapInstanceRef.current.flyTo([parcel.centroid.lat, parcel.centroid.lng], 15, { duration: 1.2 });
    } else if (parcel.geometry?.coordinates) {
      // Find approximate centroid
      try {
        const ring = parcel.geometry.coordinates[0];
        if (ring && ring.length > 0) {
          const [lng, lat] = ring[0];
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
        }
      } catch (err) {
        // fallback
      }
    }
  };

  // Fly to selected state center if state filter changes
  useEffect(() => {
    if (selectedState !== 'ALL' && STATE_COORDINATES[selectedState] && mapInstanceRef.current) {
      const coord = STATE_COORDINATES[selectedState];
      mapInstanceRef.current.flyTo(coord.center, coord.zoom, { duration: 1.2 });
    }
  }, [selectedState]);

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Official National Header Banner */}
      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-gov flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded bg-gov-navy text-white flex items-center space-x-1.5">
              <Landmark className="w-3 h-3 text-gov-saffron" />
              <span>PM GatiShakti National GIS Portal</span>
            </span>
            <span className="text-xs text-slate-500 font-semibold flex items-center space-x-1">
              <span>•</span>
              <span>RFCTLARR Act, 2013 Statutory Spatial Framework</span>
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            National Land Acquisition GIS Cadastral Explorer
          </h1>
          <p className="text-xs text-slate-500">
            OpenStreetMap & High-Resolution Satellite imagery with live GeoJSON Khasra polygons, corridor anchors, and RoR verification
          </p>
        </div>

        {/* Action Controls: Basemap Switcher & Full Extent */}
        <div className="flex items-center space-x-2 flex-wrap">
          {/* Street / Satellite Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => toggleMapLayer('street')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
                mapType === 'street'
                  ? 'bg-gov-navy text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-gov-saffron" />
              <span>Street (OSM)</span>
            </button>
            <button
              onClick={() => toggleMapLayer('satellite')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
                mapType === 'satellite'
                  ? 'bg-gov-navy text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-gov-saffron" />
              <span>Satellite Imagery</span>
            </button>
          </div>

          <button
            onClick={handleFullIndiaView}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-all"
            title="Reset to All India View"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">All India Extent</span>
          </button>
        </div>
      </div>

      {/* 2. Mandatory Cadastral Boundary Statutory Disclaimer Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl shadow-xs flex items-start space-x-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-amber-900 uppercase tracking-wide text-[11px]">
            Statutory Cadastral Boundary Notice:
          </span>
          <p className="text-amber-800 leading-relaxed">
            All spatial coordinates and polygon boundaries within this demonstration module are simulated spatial representations under the <strong>PM GatiShakti National Master Plan framework</strong> and do <strong>NOT</strong> constitute certified legal cadastral boundaries under State Land Records Acts. Certified boundaries must be obtained from State Bhulekh/Bhoomi revenue departments.
          </p>
        </div>
      </div>

      {/* 3. Comprehensive Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-gov space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-xs font-black text-gov-navy uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-gov-saffron" />
            <span>National Spatial Query Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 text-xs text-slate-500 hover:text-gov-navy font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* State Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">State Jurisdiction</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-gov-navy outline-none"
            >
              <option value="ALL">All States (National View)</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">District Revenue Circle</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-gov-navy outline-none"
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Corridor Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-gov-navy outline-none truncate"
            >
              <option value="ALL">All Corridor Projects</option>
              {availableProjects
                .filter(p => selectedState === 'ALL' || p.state === selectedState)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Acquisition Status Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Acquisition Status (8 Stages)</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-gov-navy outline-none"
            >
              <option value="ALL">All 8 Acquisition Stages</option>
              {STATUTORY_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Search Location / Parcel / Owner */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Search Location / Khasra</label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Village, Khasra, Owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-gov-navy outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    fetchGISData();
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 4. National Spatial Statistics Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Parcels */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Khasra Units</div>
          <div className="text-xl font-black text-gov-navy mt-1 font-mono">
            {statistics.totalParcels || allParcelsList.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Under Acquisition</div>
        </div>

        {/* Proposed */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Proposed / SIA</div>
          <div className="text-xl font-black text-blue-700 mt-1 font-mono">
            {(statistics.proposed || 0) + (statistics.underVerification || 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Preliminary Alignments</div>
        </div>

        {/* Notified & Awarded */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Notified & Awarded</div>
          <div className="text-xl font-black text-amber-700 mt-1 font-mono">
            {(statistics.notificationIssued || 0) + (statistics.awarded || 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sec 11 & Sec 23 Determinations</div>
        </div>

        {/* Compensation Completed */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Compensation Paid</div>
          <div className="text-xl font-black text-emerald-700 mt-1 font-mono">
            {statistics.compensationCompleted || statistics.compensationPaid || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">PFMS DBT Disbursed</div>
        </div>

        {/* Possession Completed */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-green-700 tracking-wider">Possession Taken</div>
          <div className="text-xl font-black text-green-800 mt-1 font-mono">
            {statistics.possessionCompleted || statistics.possessionTaken || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Handed Over to Agency</div>
        </div>

        {/* Total Land Area */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">Total Corridors Area</div>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">
            {Number(statistics.totalAreaHectares || 0).toFixed(1)} <span className="text-xs font-normal">Ha</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Hectares Mapped</div>
        </div>
      </div>

      {/* 5. Main Map & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left/Center: Leaflet Map Container with Floating Legend & Controls (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-gov overflow-hidden flex flex-col h-[700px] relative">
          {/* Map Target Canvas */}
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '100%' }} />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-xs flex items-center justify-center z-[1000]">
              <div className="bg-gov-navy text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 shadow-lg">
                <span className="w-3 h-3 border-2 border-gov-saffron border-t-transparent rounded-full animate-spin"></span>
                <span>Updating Spatial GeoJSON Layer...</span>
              </div>
            </div>
          )}

          {/* Map Legend Overlay (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg overflow-hidden max-w-xs transition-all">
            <div
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer text-xs font-bold text-slate-800"
            >
              <div className="flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-gov-saffron" />
                <span>Statutory Map Legend</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                {isLegendOpen ? 'Collapse' : 'Expand'}
              </span>
            </div>

            {isLegendOpen && (
              <div className="p-3 text-[10px] space-y-2 max-h-56 overflow-y-auto">
                <div className="font-bold text-slate-500 uppercase tracking-wider">
                  8 Acquisition Stages (RFCTLARR 2013)
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {STATUTORY_STATUSES.map((st) => {
                    const cfg = STATUS_COLORS[st] || { color: '#3b82f6' };
                    return (
                      <div key={st} className="flex items-center space-x-1.5">
                        <span
                          className="w-3 h-3 rounded-xs flex-shrink-0 border border-slate-300"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <span className="text-slate-700 font-medium truncate" title={st}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-2 flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gov-navy border border-gov-saffron flex items-center justify-center text-[9px] text-gov-saffron font-bold">
                    ★
                  </div>
                  <span className="text-slate-700 font-medium">National Corridor Project Anchor</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Parcel Dossier Inspector & Matching Parcels Directory (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-gov flex flex-col h-[700px] overflow-hidden">
          {/* Inspector Header */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gov-navy" />
              <h2 className="text-xs font-black text-gov-navy uppercase tracking-wider">
                {selectedParcel ? 'Cadastral Dossier (RoR)' : 'Filtered Parcels Directory'}
              </h2>
            </div>
            {selectedParcel && (
              <button
                onClick={() => setSelectedParcel(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold flex items-center space-x-1"
              >
                <span>Back to List</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Conditional Content: Selected Parcel Dossier OR Filtered Parcels List */}
          {selectedParcel ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Identity & Status */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    {selectedParcel.parcelId}
                  </span>
                  <Badge status={selectedParcel.acquisitionStatus} />
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1 font-mono">
                  Khasra No: {selectedParcel.surveyNumber || selectedParcel.khasraNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedParcel.village}, {selectedParcel.tehsil}, {selectedParcel.district}, {selectedParcel.state}
                </p>
              </div>

              {/* Infrastructure Corridor Card */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-400">Target Project Corridor</div>
                <div className="font-bold text-gov-navy text-xs">
                  {selectedParcel.project?.name || selectedParcel.projectName || 'Corridor Alignment'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedParcel.project?.type || 'Infrastructure'} • {selectedParcel.project?.ministry || 'Government of India'}
                </div>
              </div>

              {/* Area & Valuation Metrics */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Land Category:</span>
                  <span className="font-semibold text-slate-800 text-right">{selectedParcel.landCategory || 'Private Agricultural'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Acquired Area:</span>
                  <span className="font-black text-gov-navy font-mono">
                    {selectedParcel.area || selectedParcel.acquiredAreaHectares} Hectares
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Notified Circle Rate:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    ₹{(selectedParcel.circleRatePerHectare || 3500000).toLocaleString('en-IN')}/Ha
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assessed Compensation:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    ₹{(selectedParcel.compensation?.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Statutory Milestones: Compensation & Possession */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-2.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Statutory Execution Lifecycle
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 ${selectedParcel.compensation?.status === 'Disbursed' || selectedParcel.acquisitionStatus === 'Compensation Paid' || selectedParcel.acquisitionStatus === 'Completed' ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">PFMS Direct Benefit Transfer</div>
                    <div className="text-[11px] text-slate-500">
                      Status: <span className="font-semibold text-slate-700">{selectedParcel.compensation?.status || 'Assessed'}</span>
                      {selectedParcel.compensation?.utrNumber && ` • UTR: ${selectedParcel.compensation.utrNumber}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 ${selectedParcel.possession?.status === 'Taken' || selectedParcel.acquisitionStatus === 'Possession Taken' || selectedParcel.acquisitionStatus === 'Completed' ? 'text-green-600' : 'text-slate-300'}`} />
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">Physical Handover (Section 38/40)</div>
                    <div className="text-[11px] text-slate-500">
                      Status: <span className="font-semibold text-slate-700">{selectedParcel.possession?.status || 'Pending'}</span>
                      {selectedParcel.possession?.certificateNumber && ` • Cert: ${selectedParcel.possession.certificateNumber}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 ${selectedParcel.rrStatus?.houseAllotted || selectedParcel.acquisitionStatus === 'Completed' ? 'text-teal-600' : 'text-slate-300'}`} />
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">R&R Scheme (Second Schedule)</div>
                    <div className="text-[11px] text-slate-500">
                      Scheme: <span className="font-semibold text-slate-700">{selectedParcel.rrStatus?.schemeName || 'RFCTLARR Scheme'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Landowner & Affected Family */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Notified Landowner & Affected Family
                </div>
                {selectedParcel.owners && selectedParcel.owners.length > 0 ? (
                  selectedParcel.owners.map((o, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{o.name}</span>
                        <span className="text-gov-navy">{o.sharePercentage}% Share</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Aadhaar: {o.aadhaarMasked || 'XXXX-XXXX-8921'} • {o.contactPhone || '+91 98220 00000'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500">
                    Primary Owner: {selectedParcel.affectedFamilyReference?.familyHeadName || 'Shri RoR Title Holder'}
                  </div>
                )}
                {selectedParcel.affectedFamilyReference?.familyId && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    PAF Family Reference: {selectedParcel.affectedFamilyReference.familyId} ({selectedParcel.affectedFamilyReference.vulnerabilityCategory || 'General'})
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    if (setSelectedParcelForCalc) {
                      setSelectedParcelForCalc(selectedParcel);
                    }
                    navigate('/compensation');
                  }}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Verify 100% Solatium & Award</span>
                </button>

                {selectedParcel.project?.id && (
                  <button
                    onClick={() => navigate(`/projects/${selectedParcel.project.id}`)}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Corridor Project Dossier</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* List of Filtered Parcels with quick-focus */
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              <div className="p-2.5 bg-slate-50/70 border-b border-slate-100 text-[11px] text-slate-500 flex justify-between font-medium">
                <span>Showing {allParcelsList.length} Cadastral Units</span>
                <span>Click to inspect & fly map</span>
              </div>

              {allParcelsList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2 my-auto">
                  <Compass className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">No land parcels match active filters.</p>
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 bg-gov-navy text-white text-xs font-bold rounded-lg"
                  >
                    Reset Query Filters
                  </button>
                </div>
              ) : (
                allParcelsList.map((p) => {
                  const statusCfg = STATUS_COLORS[p.acquisitionStatus] || { color: '#3b82f6' };
                  return (
                    <div
                      key={p.parcelId}
                      onClick={() => handleSelectParcel(p)}
                      className="p-3 cursor-pointer hover:bg-slate-50 transition-all border-l-4 border-l-transparent hover:border-l-gov-saffron group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-gov-navy group-hover:text-gov-saffron transition-colors">
                          Khasra {p.surveyNumber || p.khasraNumber}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          {p.area || p.acquiredAreaHectares} Ha
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 mt-1 truncate">
                        Village: <span className="font-semibold">{p.village}</span> ({p.district}, {p.state})
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <Badge status={p.acquisitionStatus} />
                        <span className="text-[10px] text-slate-400 font-mono">
                          ₹{((p.circleRatePerHectare || 3500000) / 100000).toFixed(1)}L/Ha
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer Status Counter */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between font-medium">
            <span>PM GatiShakti Spatial Layer</span>
            <span>OSM Cadastral Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}
