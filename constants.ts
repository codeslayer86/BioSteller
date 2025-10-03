// This file's content has been cleared as mock data is no longer used by the application.

export const categories = [
    {
      title: "Plant Biology in Space",
      items: [
        "Plant growth in microgravity", "Space farming & food production", "Hydroponics & aeroponics in space", "Root shape & direction in microgravity", "Water absorption in space-grown plants", "Photosynthesis efficiency in low gravity", "Seed germination experiments on ISS", "Nutrient uptake & stress response in plants", "Plant immune response in space", "Tomato growth in space", "Arabidopsis growth in microgravity", "Wheat growth in spaceflight"
      ]
    },
    {
      title: "Human Health & Physiology",
      items: [
        "Human body changes in in space", "Astronaut health during long-duration missions", "Bone density loss in astronauts", "Muscle atrophy in microgravity", "Cardiovascular system changes in space", "Immune system response in astronauts", "Circadian rhythm disruption in space", "Stress hormones in astronauts", "Mental health adaptation in space", "Sleep quality in space missions"
      ]
    },
    {
      title: "Microbes & Microbiology",
      items: [
        "Microbial life in ISS environment", "Bacterial growth in microgravity", "Antibiotic resistance in space-grown bacteria", "Astronaut microbiome shifts in space", "Pathogen behavior in ISS", "Fungal and mold contamination in spacecraft", "Microbes in closed-loop life support systems"
      ]
    },
    {
      title: "Molecular & Cellular Biology",
      items: [
        "Cellular adaptation in microgravity", "Gene expression changes in space", "DNA damage and repair in cosmic radiation", "Stem cell growth in microgravity", "Cell division and differentiation in space", "Protein crystallization in zero gravity", "Cancer cell behavior in space", "Molecular biology experiments on ISS"
      ]
    },
    {
      title: "Radiation Biology",
      items: [
        "Effects of cosmic radiation on astronauts", "Radiation damage to human DNA in space", "Plant DNA mutations from space radiation", "Protective shielding against space radiation", "Comparison of space radiation vs Earth radiation"
      ]
    },
    {
      title: "Model Organisms in Space",
      items: [
        "Mice experiments in space", "Zebrafish in microgravity research", "Fruit flies (Drosophila) in space genetics", "C. elegans (worms) in space aging studies", "Yeast experiments in microgravity", "Algae growth in space"
      ]
    },
    {
      title: "Research & Educational Queries",
      items: [
        "NASA space biology experiment database", "Open datasets for student research", "List of biology experiments on ISS", "Shuttle-based biology experiments archive", "Artemis program space biology research", "NASA ADS papers on space immunology", "PubMed search: Space Biology", "GeneLab dataset: Plants in microgravity", "GeneLab dataset: Animals in microgravity", "GeneLab dataset: Microbes in space"
      ]
    }
];

export const allTopics = categories.flatMap(cat => cat.items);

export const ORGANISM_TYPES = [
  "Human",
  "Mice",
  "Rats",
  "Zebrafish",
  "Fruit flies",
  "Plants",
  "Microbes",
  "Fungi",
  "C. elegans",
  "Yeast",
  "Algae",
  "Other",
];

export const MISSION_PLATFORMS = [
  "ISS",
  "Shuttle",
  "GeneLab",
  "VEGGIE",
  "Rodent Research",
  "Artemis",
  "Twins Study",
  "Other",
  "N/A",
];

export const RESEARCH_AREAS = categories.map(cat => cat.title);

export const PUBLICATION_TYPES = [
  "Dataset",
  "Publication/Paper",
  "Experiment",
  "Article",
  "Report",
  "Other",
];