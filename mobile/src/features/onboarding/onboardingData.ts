export interface Slide {
    id: string;
    title: string;
    subtitle: string;
    source: any;
}

export const slides: Slide[] = [
    {
        id: '1',
        title: 'Smart AI. Real World.',
        subtitle: 'We don\'t just chat. We build verified, logistic-proof itineraries. No hallucinations.',
        source: require('../../../assets/animations/ai-guide.json'),
    },
    {
        id: '2',
        title: 'Curated, Not Copied',
        subtitle: 'Stop getting generic lists. Swipe right to teach our AI exactly what YOU love.',
        source: require('../../../assets/animations/swipe-mechanic.json'),
    },
    {
        id: '3',
        title: 'Plans That Adapt',
        subtitle: 'Rainy day? Flight delayed? Our AI adjusts your schedule instantly.',
        source: require('../../../assets/animations/adaptive-time.json'),
    },
];
