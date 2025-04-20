//File contains the information about the items in stock and the events with their associated stock needed and images
const Stocks = {
    cop: [
        { value: 'handcuffs', label: 'Handcuffs' },
        { value: 'breathalizer', label: 'Breathalyzer' },
        { value: 'taser', label: 'Taser' },
        { value: 'radio', label: 'Radio' },
        { value: 'baton', label: 'Baton' },
        { value: 'spike-strips', label: 'Spike Strips' },
        { value: 'flashlight', label: 'Flashlight' },
        { value: 'crowbar', label: 'Crowbar' },
        { value: 'kevlar-vest', label: 'Kevlar Vest' },
    ],
    fire: [
        { value: 'metalcutter', label: 'Metal Cutter' },
        { value: 'ladder', label: 'Ladder' },
        { value: 'hose', label: 'Hose' },
        { value: 'fire-extinguisher', label: 'Fire Extinguisher' },
        { value: 'breathing-apparatus', label: 'Breathing Apparatus' },
        { value: 'axe', label: 'Axe' },
        { value: 'thermal-camera', label: 'Thermal Camera' },
        { value: 'fire-blanket', label: 'Fire Blanket' },
        { value: 'jaws-of-life', label: 'Jaws of Life' },
    ],
    ems: [
        { value: 'stretcher', label: 'Stretcher' },
        { value: 'burn-kit', label: 'Burn Kit' },
        { value: 'defibrillator', label: 'Defibrillator' },
        { value: 'oxygen-tank', label: 'Oxygen Tank' },
        { value: 'first-aid-kit', label: 'First Aid Kit' },
        { value: 'splint', label: 'Splint' },
        { value: 'epipen', label: 'EpiPen' },
        { value: 'cervical-collar', label: 'Cervical Collar' },
        { value: 'trauma-kit', label: 'Trauma Kit' },
    ],
    main: [
        { value: 'manhole-cover', label: 'Manhole Cover' },
        { value: 'fuse', label: 'Fuse' },
        { value: 'wrench', label: 'Wrench' },
        { value: 'shovel', label: 'Shovel' },
        { value: 'chainsaw', label: 'Chainsaw' },
        { value: 'generator', label: 'Generator' },
        { value: 'road-signs', label: 'Road Signs' },
        { value: 'toolbox', label: 'Toolbox' },
        { value: 'drain-pump', label: 'Drain Pump' },
    ]
};
// I would like to add a random image that can appear that isnt related so the user can say this is not a real event
const Events = [
    {
        title: "House Fire",
        description: "A single-story residential building has caught on fire, multiple burn victims present.",
        requiredStock: ['burn-kit'],
        image: '/events/house_fire.jpg',
        priority: 1
    },
    {
        title: "Traffic Accident",
        description: "Two cars have collided at an intersection, passengers trapped inside.",
        requiredStock: ['jaws-of-life'],
        image: "/events/traffic_accident.jpg",
        priority: 2
    },
    {
        title: "Armed Robbery",
        description: "A store has been robbed, suspect fleeing on foot.",
        requiredStock: ['handcuffs'],
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
    // {
    //     title: "Medical Emergency",
    //     description: "A person has collapsed at a shopping mall, no pulse detected.",
    //     requiredStock: ['defibrillator', 'oxygen-tank'],
    //     image: "/events/medical_emergency.jpg" 
    // },
    // {
    //     title: "Power Outage",
    //     description: "A neighborhood has lost power due to a transformer failure.",
    //     requiredStock: ['generator', 'fuse'],
    //     image: "/events/power_outage.jpg"  },
    // {
    //     title: "Flooded Basement",
    //     description: "A water pipe burst has flooded a residential basement.",
    //     requiredStock: ['drain-pump', 'shovel'],
    //     image: "/events/flooded_basement.jpg"    },
    // {
    //     title: "Bank Hostage Situation",
    //     description: "Armed individuals are holding civilians inside a bank.",
    //     requiredStock: ['kevlar-vest', 'taser', 'radio'],
    //     image: "/events/bank_hostage_situation.jpg"    },
    // {
    //     title: "Protest Turned Violent",
    //     description: "A demonstration has turned into a riot, requiring police intervention.",
    //     requiredStock: ['baton', 'handcuffs', 'flashlight'],
    //     image: "/events/protest_turned_violent.jpg"    },
    // {
    //     title: "Tree Blocking Road",
    //     description: "A fallen tree is obstructing a main road, affecting traffic flow.",
    //     requiredStock: ['chainsaw', 'road-signs'],
    //     image: "/events/tree_blocking_road.jpg"
    // },
    // {
    //     title: "Warehouse Fire",
    //     description: "A large warehouse is engulfed in flames, risk of collapse.",
    //     requiredStock: ['hose', 'thermal-camera', 'breathing-apparatus'],
    //     image: "/events/warehouse_fire.jpg"
    // },
    // {
    //     title: "DUI Checkpoint",
    //     description: "Officers are setting up a DUI checkpoint to catch drunk drivers.",
    //     requiredStock: ['breathalizer', 'handcuffs'],
    //     image: "/events/dui_checkpoint.jpg"
    // },
    // {
    //     title: "Person Trapped in Elevator",
    //     description: "An elevator is stuck between floors with a person inside.",
    //     requiredStock: ['crowbar', 'wrench'],
    //     image: "/events/person_trapped_in_elevator.jpg"
    // },
    // {
    //     title: "Missing Child",
    //     description: "A young child has gone missing in a crowded park.",
    //     requiredStock: ['flashlight', 'radio'],
    //     image: "/events/missing_child.jpg"
    // },
    // {
    //     title: "Collapsed Scaffold",
    //     description: "A scaffold has collapsed at a construction site, workers injured.",
    //     requiredStock: ['stretcher', 'cervical-collar'],
    //     image: "/events/collapsed_scaffold.jpg"
    // },
    // {
    //     title: "Animal Rescue",
    //     description: "A cat is stuck on a tall tree, unable to get down.",
    //     requiredStock: ['ladder'],
    //     image: "/events/animal_rescue.jpg"
    // },
    // {
    //     title: "Train Derailment",
    //     description: "A train has derailed, several passengers injured.",
    //     requiredStock: ['jaws-of-life', 'stretcher', 'oxygen-tank'],
    //     image: "/events/train_derailment.jpg"
    // },
    // {
    //     title: "Chemical Spill",
    //     description: "Hazardous chemicals have spilled at a factory, risk of toxic exposure.",
    //     requiredStock: ['breathing-apparatus', 'fire-blanket'],
    //     image: "/events/chemical_spill.jpg"
    // },
    // {
    //     title: "Stray Dog Attack",
    //     description: "A stray dog has bitten a passerby, bleeding heavily.",
    //     requiredStock: ['first-aid-kit', 'trauma-kit'],
    //     image: "/events/stray_dog_attack.jpg"
    // },
    // {
    //     title: "Car Stuck on Tracks",
    //     description: "A vehicle is stranded on railway tracks, train approaching.",
    //     requiredStock: ['crowbar', 'radio'],
    //     image: "/events/car_stuck_on_tracks.jpg"
    // },
    // {
    //     title: "Boating Accident",
    //     description: "Two boats have collided in the lake, people overboard.",
    //     requiredStock: ['lifebuoy', 'stretcher'],
    //     image: "/events/boating_accident.jpg"
    // },
    // {
    //     title: "Gas Station Explosion",
    //     description: "A gas station explosion has injured multiple people.",
    //     requiredStock: ['fire-extinguisher', 'burn-kit', 'stretcher'],
    //     image: "/events/gas_station_explosion.jpg"
    // },
    // {
    //     title: "Escaped Prisoner",
    //     description: "A prisoner has escaped during transport, last seen near downtown.",
    //     requiredStock: ['radio', 'taser', 'handcuffs'],
    //     image: "/events/escaped_prisoner.jpg"
    // },
    // {
    //     title: "Sewer Line Backup",
    //     description: "A major sewer line is blocked, causing flooding in streets.",
    //     requiredStock: ['drain-pump', 'manhole-cover'],
    //     image: "/events/sewer_line_backup.jpg"
    // }
];

export { Stocks, Events };
