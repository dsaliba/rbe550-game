//File contains the information about the items in stock and the events with their associated stock needed and images
const Stocks = {
    cop: [
        { value: 'handcuffs', label: 'Handcuffs' },
        { value: 'breathalizer', label: 'Breathalyzer' },
        { value: 'spike-strips', label: 'Spike Strips' },
        { value: 'flashlight', label: 'Flashlight' },
        { value: 'kevlar-vest', label: 'Kevlar Vest' },
    ],
    fire: [
        { value: 'ladder', label: 'Ladder' },
        { value: 'fire-hose', label: 'Fire Hose' },
        { value: 'jaws-of-life', label: 'Jaws of Life' },
    ],
    ems: [
        { value: 'burn-kit', label: 'Burn Kit' },
        { value: 'defibrillator', label: 'Defibrillator' },
        { value: 'splint', label: 'Splint' },
        { value: 'epipen', label: 'EpiPen' },
        { value: 'tourniquet', label:'Tourniquet'}
    ],
    main: [
        { value: 'breathing-apparatus', label: 'Breathing Apparatus' },
        { value: 'manhole-cover', label: 'Manhole Cover' },
        { value: 'fuse', label: 'Fuse' },
        { value: 'chainsaw', label: 'Chainsaw' },
        { value: 'drain-pump', label: 'Drain Pump' },
    ]
    
};
// I would like to add a random image that can appear that isnt related so the user can say this is not a real event
const Events = [
    {
        title: "House Fire",
        description: "A single-story residential building has caught on fire, multiple burn victims present.",
        requiredStock: ['burn-kit', 'fire-hose', 'breathalizer'],
        image: '/events/house_fire.jpg',
        priority: 1
    },
    {
        title: "Traffic Accident",
        description: "Two cars have collided at an intersection, passengers trapped inside, heavy bleeding, possible DUI.",
        requiredStock: ['jaws-of-life', 'tourniquet'],
        image: "/events/traffic_accident.jpg",
        priority: 2
    },
    {
        title: "Armed Robbery",
        description: "A store has been robbed, armed suspect fleeing on foot.",
        requiredStock: ['handcuffs', 'kevlar-vest'],
        image: "/events/armed_robbery.jpg",
        priority: 3
    },
    {
        title: "Gas Leak",
        description: "A strong smell of gas has been reported in an apartment complex.",
        requiredStock: ['breathing-apparatus'],
        image: "/events/gas_leak.jpg",
        priority: 5      
    },
    {
        title: "Medical Emergency",
        description: "A person has collapsed at a shopping mall, no pulse detected.",
        requiredStock: ['defibrillator'],
        image: "/events/medical_emergency.jpg",
        priority: 3
    },
    {
        title: "Power Outage",
        description: "A neighborhood has lost power due to a blown fuse",
        requiredStock: ['fuse'],
        image: "/events/power_outage.jpg"  ,
        priority: 3,
    },
        
    {
        title: "Flooded Basement",
        description: "A water pipe burst has flooded a residential basement, resident has slipped and fallen, possible fracture.",
        requiredStock: ['drain-pump', 'splint'],
        image: "/events/flooded_basement.jpg",
        priority: 3    },
    {
        title: "Tree Blocking Road",
        description: "A fallen tree is obstructing a main road.",
        requiredStock: ['chainsaw'],
        image: "/events/tree_blocking_road.jpg",
        priority: 3
    },
    {
        title: "Out of Control Party",
        description: "A party has gotten out of hand, intoxicated suspects and victims falling out of window ",
        requiredStock: ['breathalizer', 'handcuffs', 'splint'],
        image: "/events/collapsed_scaffold.jpg"
    },
    {
        title: "Animal Rescue",
        description: "A cat is stuck on a tall tree, unable to get down.",
        requiredStock: ['ladder'],
        image: "/events/animal_rescue.jpg"
    },


    {
        title: "Gas Station Explosion",
        description: "A gas station explosion has injured multiple people.",
        requiredStock: ['fire-hose', 'burn-kit'],
        image: "/events/gas_station_explosion.jpg"
    },
    {
        title: "Escaped Prisoner",
        description: "A prisoner has escaped during transport, last seen near downtown.",
        requiredStock: ['handcuffs'],
        image: "/events/escaped_prisoner.jpg"
    },
    {
        title: "Sewer Line Backup",
        description: "A major sewer line is blocked, causing flooding in streets.",
        requiredStock: ['drain-pump'],
        image: "/events/sewer_line_backup.jpg"
    }

];

export { Stocks, Events };
