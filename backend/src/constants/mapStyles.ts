/**
 * Backend Constants: Map Styles
 * Extracted from placeDiscovery.service.ts for maintainability
 */

/**
 * Dark Mode / Technical Sketch style for Google Static Maps API
 * Based on Google's Night Mode style with custom adjustments
 */
export const DARK_MAP_STYLE = [
    'element:geometry|color:0x242f3e',
    'element:labels.text.stroke|color:0x242f3e',
    'element:labels.text.fill|color:0x746855',
    'feature:administrative.locality|element:labels.text.fill|color:0xd59563',
    'feature:poi|element:labels.text.fill|color:0xd59563',
    'feature:poi.park|element:geometry|color:0x263c3f',
    'feature:poi.park|element:labels.text.fill|color:0x6b9a76',
    'feature:road|element:geometry|color:0x38414e',
    'feature:road|element:geometry.stroke|color:0x212a37',
    'feature:road|element:labels.text.fill|color:0x9ca5b3',
    'feature:road.highway|element:geometry|color:0x746855',
    'feature:road.highway|element:geometry.stroke|color:0x1f2835',
    'feature:road.highway|element:labels.text.fill|color:0xf3d19c',
    'feature:transit|element:geometry|color:0x2f3948',
    'feature:transit.station|element:labels.text.fill|color:0xd59563',
    'feature:water|element:geometry|color:0x17263c',
    'feature:water|element:labels.text.fill|color:0x515c6d',
    'feature:water|element:labels.text.stroke|color:0x17263c'
].join('&style=');

/**
 * Converts style array to URL-encoded query string
 */
export function getMapStyleQueryString(): string {
    return '&style=' + DARK_MAP_STYLE;
}

/**
 * Static Maps API configuration
 */
export const STATIC_MAP_CONFIG = {
    zoom: 15,
    size: '600x300',
    mapType: 'roadmap' as const,
    markerColor: '0x7c3aed', // Kamino violet
} as const;
