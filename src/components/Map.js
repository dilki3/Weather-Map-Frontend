import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const MapComponent = () => {
    const mapRef = useRef(null);
    let map; // Define map outside of useEffect
    let districtsLayer;
    useEffect(() => {
        
        map = L.map(mapRef.current, {
            fullscreenControl: true 
        }).setView([7.8731, 80.7718], 8); 

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        axios.get('/geojson/sri lanka district.geojson')
            .then(response => {
                // Add GeoJSON layer to map
                districtsLayer = L.geoJSON(response.data, {
                    style: {
                        color: 'green', 
                        weight: 1 
                    },
                    onEachFeature: (feature, layer) => {
                        layer.on({
                            mouseover: handleDistrictHover,
                            mouseout: resetHighlight
                        });
                    }
                }).addTo(map);
            })
            .catch(error => {
                console.error('Error loading district data:', error);
            });

        return () => {
            map.remove(); // Clean up map when component unmounts
        };
    }, []);
    


    
    const handleDistrictHover = (e) => {
        const layer = e.target;
        const districtName = layer.feature.properties.name;

        
        layer.setStyle({
            fillColor: 'green', 
            fillOpacity: 0.7 
        });

        // Fetch weather data for the hovered district
        axios.get(`http://localhost:3001/weather?district=${districtName}`)
            .then(response => {
                const weatherData = response.data;

                
                console.log(`Weather data for ${districtName}:`, weatherData);

                
                const tooltipContent = `
                    <div>
                        <strong>${districtName}</strong><br/>
                        Temperature: ${weatherData.temperature}°C<br/>
                        Humidity: ${weatherData.humidity}%<br/>
                        Air Pressure: ${weatherData.air_pressure} hPa
                    </div>
                `;

                
                if (mapRef.current.tooltip) {
                    mapRef.current.tooltip.remove();
                }

                // Create and bind tooltip to the district layer
                const tooltip = L.tooltip({ direction: 'top', offset: [0, -20] })
                    .setContent(tooltipContent)
                    .setLatLng(e.latlng)
                    .addTo(map);

                mapRef.current.tooltip = tooltip;
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    };

    const resetHighlight = (e) => {
        const layer = e.target;
        districtsLayer.resetStyle(layer);
        if (mapRef.current && mapRef.current.tooltip) {
            mapRef.current.tooltip.closeTooltip();
        }
    };
    return <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default MapComponent;

