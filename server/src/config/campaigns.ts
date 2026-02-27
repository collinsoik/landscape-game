import type { Campaign, MissionConfig } from './scenarios';

// === "Greenfield Park" — Beginner Campaign (12 missions, 3 chapters) ===
// REBALANCED: score thresholds adjusted for new economy, budgets increased where needed

export const GREENFIELD_PARK: Campaign = {
  id: 'greenfield_park',
  name: 'Greenfield Park',
  description: 'Learn ecology through quick puzzle missions! Build gardens, fix problems, and survive dramatic events.',
  difficulty: 'beginner',
  chapters: [
    {
      id: 'ch1_first_seeds',
      name: 'First Seeds',
      unlockStars: 0,
      missions: [
        {
          id: 'flower_bed',
          missionType: 'build',
          title: 'Flower Bed',
          narrative: 'A bare garden plot awaits! Fill it with colorful flowers to attract visitors.',
          ecoLesson: 'Flowers provide nectar and pollen for pollinators like bees and butterflies. A diverse flower garden supports the food web.',
          budget: 6,
          actionLimit: 6,
          refundRate: 0.75,
          availableCategories: ['flowers', 'ground_cover'],
          startingPlacements: [],
          durationSeconds: 90,
          objectives: [
            { id: 'fb_score', text: 'Score 10+ in aesthetics', condition: { type: 'min_score', category: 'aesthetics', threshold: 10 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['fb_score'] },
            twoStar: { objectives: ['fb_score'], minScore: 20 },
            threeStar: { objectives: ['fb_score'], minScore: 30, noConflicts: true },
          },
        },
        {
          id: 'pollinator_paradise',
          missionType: 'build',
          title: 'Pollinator Paradise',
          narrative: 'A new garden plot needs pollinators to thrive. Create a Pollinator Garden pattern!',
          ecoLesson: 'Pollinator gardens combine wildflowers, sunflowers, and insect hotels to support bees. These insects pollinate 75% of flowering plants.',
          budget: 8,
          actionLimit: 6,
          refundRate: 0.75,
          availableCategories: ['flowers', 'structures'],
          startingPlacements: [],
          durationSeconds: 90,
          objectives: [
            { id: 'pp_pattern', text: 'Achieve Pollinator Garden pattern', condition: { type: 'pattern', patternName: 'Pollinator Garden' } },
          ],
          starThresholds: {
            oneStar: { objectives: ['pp_pattern'] },
            twoStar: { objectives: ['pp_pattern'], minSynergies: 2 },
            threeStar: { objectives: ['pp_pattern'], minSynergies: 3, noConflicts: true },
          },
        },
        {
          id: 'shade_shuffle',
          missionType: 'fix',
          title: 'Shade Shuffle',
          narrative: 'Someone planted sunflowers right under the oak trees! Rearrange elements to fix the conflicts.',
          ecoLesson: 'Different plants need different amounts of sunlight. Sunflowers need full sun, while ferns prefer shade. Matching plants to their conditions is key to a healthy garden.',
          budget: 4,
          actionLimit: 6,
          refundRate: 0.5,
          availableCategories: ['flowers', 'ground_cover', 'trees'],
          startingPlacements: [
            { elementType: 'oak_tree', x: 300, y: 300 },
            { elementType: 'sunflower_cluster', x: 310, y: 310 },
            { elementType: 'oak_tree', x: 600, y: 400 },
            { elementType: 'sunflower_cluster', x: 610, y: 410 },
          ],
          durationSeconds: 75,
          objectives: [
            { id: 'ss_fix', text: 'Remove all conflicts', condition: { type: 'no_conflicts' } },
          ],
          starThresholds: {
            oneStar: { objectives: ['ss_fix'] },
            twoStar: { objectives: ['ss_fix'], minSynergies: 1 },
            threeStar: { objectives: ['ss_fix'], minSynergies: 2, maxCoinsSpent: 3 },
          },
        },
        {
          id: 'sixty_second_sprint',
          missionType: 'race',
          title: '60-Second Sprint',
          narrative: 'You have just 60 seconds — maximize your score! Pure speed optimization.',
          ecoLesson: 'In real ecology, quick decisions matter too. Emergency restoration projects must prioritize the most impactful actions first.',
          budget: 8,
          actionLimit: 8,
          refundRate: 0.5,
          availableCategories: ['flowers', 'ground_cover', 'shrubs', 'trees'],
          startingPlacements: [],
          durationSeconds: 60,
          objectives: [
            { id: 'ss_score', text: 'Score 20+ total', condition: { type: 'min_score', threshold: 20 } },
          ],
          starThresholds: {
            oneStar: { minScore: 20 },
            twoStar: { minScore: 35 },
            threeStar: { minScore: 50, minSynergies: 2 },
          },
        },
      ],
    },
    {
      id: 'ch2_growing_pains',
      name: 'Growing Pains',
      unlockStars: 6,
      missions: [
        {
          id: 'weed_invasion',
          missionType: 'fix',
          title: 'Weed Invasion',
          narrative: 'Invasive species have infiltrated the garden! Remove them and rebuild with native plants.',
          ecoLesson: 'Invasive species outcompete native plants for resources. Removing them is the first step in ecological restoration.',
          budget: 5,
          actionLimit: 6,
          refundRate: 0.5,
          availableCategories: ['flowers', 'ground_cover', 'shrubs'],
          startingPlacements: [
            { elementType: 'invasive_vine', x: 200, y: 200 },
            { elementType: 'invasive_vine', x: 500, y: 350 },
            { elementType: 'invasive_grass', x: 350, y: 500 },
            { elementType: 'invasive_grass', x: 700, y: 250 },
            { elementType: 'native_shrub', x: 400, y: 400 },
          ],
          durationSeconds: 90,
          objectives: [
            { id: 'wi_clear', text: 'Remove all invasive species', condition: { type: 'remove_all_invasives' } },
            { id: 'wi_score', text: 'Score positive total', condition: { type: 'min_score', threshold: 1 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['wi_clear'] },
            twoStar: { objectives: ['wi_clear', 'wi_score'], minScore: 15 },
            threeStar: { objectives: ['wi_clear', 'wi_score'], minScore: 25, minSynergies: 1 },
          },
        },
        {
          id: 'bird_corner',
          missionType: 'build',
          title: 'Bird Corner',
          narrative: 'A tall oak already stands in the corner. Build a Bird Sanctuary around it!',
          ecoLesson: 'Birds need food (berries), water (birdbath), and shelter (birdhouse) all nearby. This trio creates a self-sustaining habitat.',
          budget: 6,
          actionLimit: 6,
          refundRate: 0.5,
          availableCategories: ['shrubs', 'water_features', 'structures', 'wildlife_habitat'],
          startingPlacements: [
            { elementType: 'oak_tree', x: 400, y: 350 },
          ],
          durationSeconds: 90,
          objectives: [
            { id: 'bc_pattern', text: 'Achieve Bird Sanctuary pattern', condition: { type: 'pattern', patternName: 'Bird Sanctuary' } },
          ],
          starThresholds: {
            oneStar: { objectives: ['bc_pattern'] },
            twoStar: { objectives: ['bc_pattern'], minSynergies: 2 },
            threeStar: { objectives: ['bc_pattern'], minSynergies: 3, minScore: 35 },
          },
        },
        {
          id: 'drought_warning',
          missionType: 'survive',
          title: 'Drought Warning',
          narrative: 'Build a beautiful garden, but beware — a drought hits at 60 seconds! Water-hungry plants without nearby water features will wilt.',
          ecoLesson: 'Climate change increases drought frequency. Xeriscaping (using drought-tolerant plants) and strategic water feature placement build resilience.',
          budget: 8,
          actionLimit: 8,
          refundRate: 0.5,
          availableCategories: ['flowers', 'ground_cover', 'shrubs', 'water_features'],
          startingPlacements: [],
          durationSeconds: 120,
          midMissionEvents: [
            { eventType: 'drought', triggerType: 'time', triggerTime: 60 },
          ],
          objectives: [
            { id: 'dw_survive', text: 'Score 18+ after the drought', condition: { type: 'min_score', threshold: 18 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['dw_survive'] },
            twoStar: { objectives: ['dw_survive'], minScore: 28 },
            threeStar: { objectives: ['dw_survive'], minScore: 40, noConflicts: true },
          },
        },
        {
          id: 'five_elements',
          missionType: 'race',
          title: 'Five Elements',
          narrative: 'Only 5 placements allowed — every choice matters. Maximize your score with minimal moves.',
          ecoLesson: 'Conservation often works with limited resources. Choosing the right species for the right location maximizes ecological impact.',
          budget: 12,
          actionLimit: 5,
          refundRate: 0.25,
          availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat'],
          startingPlacements: [],
          durationSeconds: 90,
          objectives: [
            { id: 'fe_score', text: 'Score 28+ total', condition: { type: 'min_score', threshold: 28 } },
          ],
          starThresholds: {
            oneStar: { minScore: 28 },
            twoStar: { minScore: 42, minSynergies: 2 },
            threeStar: { minScore: 55, minSynergies: 3, maxCoinsSpent: 10 },
          },
        },
      ],
    },
    {
      id: 'ch3_master_ecologist',
      name: 'Master Ecologist',
      unlockStars: 14,
      missions: [
        {
          id: 'invasive_spread',
          missionType: 'survive',
          title: 'Invasive Spread',
          narrative: 'Build fast — invasive species will auto-spawn at 45s and 90s near your best clusters!',
          ecoLesson: 'Invasive species spread rapidly in disturbed habitats. Vigilant monitoring and quick response are essential for ecosystem management.',
          budget: 7,
          actionLimit: 8,
          refundRate: 0.5,
          availableCategories: ['flowers', 'ground_cover', 'shrubs', 'trees'],
          startingPlacements: [],
          durationSeconds: 120,
          midMissionEvents: [
            { eventType: 'invasive_spawn', triggerType: 'time', triggerTime: 45 },
            { eventType: 'invasive_spawn', triggerType: 'time', triggerTime: 90 },
          ],
          objectives: [
            { id: 'is_clear', text: 'Remove all invasives', condition: { type: 'remove_all_invasives' } },
            { id: 'is_score', text: 'Score 20+ total', condition: { type: 'min_score', threshold: 20 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['is_score'] },
            twoStar: { objectives: ['is_clear', 'is_score'], minScore: 32 },
            threeStar: { objectives: ['is_clear', 'is_score'], minScore: 42, minSynergies: 3 },
          },
        },
        {
          id: 'forest_floor',
          missionType: 'restore',
          title: 'Forest Floor',
          narrative: 'Two oaks stand tall but the forest floor is bare. Add understory shrubs, ground cover, and habitat elements.',
          ecoLesson: 'Healthy forests have layers: canopy trees, understory shrubs, and ground cover. Each layer supports different species and ecological functions.',
          budget: 10,
          actionLimit: 8,
          refundRate: 0.5,
          availableCategories: ['shrubs', 'ground_cover', 'flowers', 'wildlife_habitat'],
          startingPlacements: [
            { elementType: 'oak_tree', x: 300, y: 300 },
            { elementType: 'oak_tree', x: 600, y: 400 },
          ],
          durationSeconds: 120,
          objectives: [
            { id: 'ff_pattern', text: 'Achieve Woodland Edge pattern', condition: { type: 'pattern', patternName: 'Woodland Edge' } },
            { id: 'ff_synergies', text: 'Create 3+ synergies', condition: { type: 'min_synergies', count: 3 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['ff_pattern'] },
            twoStar: { objectives: ['ff_pattern', 'ff_synergies'], minScore: 35 },
            threeStar: { objectives: ['ff_pattern', 'ff_synergies'], minScore: 50, noConflicts: true },
          },
        },
        {
          id: 'budget_cut_mission',
          missionType: 'survive',
          title: 'Budget Cut',
          narrative: 'Start building your dream garden — but your budget gets halved at 60 seconds! Front-load expensive items.',
          ecoLesson: 'Conservation funding is unpredictable. Successful projects plan for funding changes and prioritize high-impact actions early.',
          budget: 10,
          actionLimit: 10,
          refundRate: 0.5,
          availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures'],
          startingPlacements: [],
          durationSeconds: 120,
          midMissionEvents: [
            { eventType: 'budget_cut', triggerType: 'time', triggerTime: 60 },
          ],
          objectives: [
            { id: 'bc_score', text: 'Score 35+ total', condition: { type: 'min_score', threshold: 35 } },
            { id: 'bc_synergies', text: 'Create 2+ synergies', condition: { type: 'min_synergies', count: 2 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['bc_score'] },
            twoStar: { objectives: ['bc_score', 'bc_synergies'], minScore: 50 },
            threeStar: { objectives: ['bc_score', 'bc_synergies'], minScore: 65, noConflicts: true },
          },
        },
        {
          id: 'grand_design',
          missionType: 'build',
          title: 'Grand Design',
          narrative: 'The capstone mission! Build a landscape that achieves 3 ecosystem patterns. Show everything you\'ve learned.',
          ecoLesson: 'Thriving ecosystems aren\'t random — they\'re designed through understanding relationships between species, water, soil, and sunlight.',
          budget: 15,
          actionLimit: 14,
          refundRate: 0.5,
          availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat'],
          startingPlacements: [],
          durationSeconds: 120,
          objectives: [
            { id: 'gd_patterns', text: 'Achieve 3 ecosystem patterns', condition: { type: 'min_patterns', count: 3 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['gd_patterns'] },
            twoStar: { objectives: ['gd_patterns'], minScore: 70, minSynergies: 5 },
            threeStar: { objectives: ['gd_patterns'], minScore: 95, minSynergies: 7, noConflicts: true },
          },
        },
      ],
    },
  ],
};

// === "Invasive Takeover" — Intermediate Campaign (adapted from existing scenario) ===

export const INVASIVE_TAKEOVER_CAMPAIGN: Campaign = {
  id: 'invasive_takeover_campaign',
  name: 'Invasive Takeover',
  description: 'The park is overrun with invasive species! Clear, rebuild, and defend across 6 intense missions.',
  difficulty: 'intermediate',
  chapters: [
    {
      id: 'it_ch1_clear',
      name: 'Clear the Invasion',
      unlockStars: 0,
      missions: [
        {
          id: 'it_first_contact',
          missionType: 'fix',
          title: 'First Contact',
          narrative: 'Invasive vines have appeared! Remove them before they damage native plants.',
          ecoLesson: 'Early detection and rapid response is the most cost-effective strategy against invasive species.',
          budget: 5,
          actionLimit: 6,
          refundRate: 0.5,
          availableCategories: ['flowers', 'ground_cover'],
          startingPlacements: [
            { elementType: 'invasive_vine', x: 300, y: 300 },
            { elementType: 'invasive_vine', x: 600, y: 400 },
            { elementType: 'native_shrub', x: 450, y: 350 },
          ],
          durationSeconds: 75,
          objectives: [
            { id: 'fc_clear', text: 'Remove all invasives', condition: { type: 'remove_all_invasives' } },
          ],
          starThresholds: {
            oneStar: { objectives: ['fc_clear'] },
            twoStar: { objectives: ['fc_clear'], minScore: 10 },
            threeStar: { objectives: ['fc_clear'], minScore: 20, noConflicts: true },
          },
        },
        {
          id: 'it_full_assault',
          missionType: 'fix',
          title: 'Full Assault',
          narrative: 'A major infestation! 6 invasives threaten the whole garden. Clear them all and plant natives.',
          ecoLesson: 'Invasive species cost the US economy over $120 billion annually in ecological damage and control efforts.',
          budget: 8,
          actionLimit: 8,
          refundRate: 0.5,
          availableCategories: ['flowers', 'ground_cover', 'trees'],
          startingPlacements: [
            { elementType: 'invasive_vine', x: 150, y: 200 },
            { elementType: 'invasive_vine', x: 450, y: 350 },
            { elementType: 'invasive_vine', x: 750, y: 150 },
            { elementType: 'invasive_grass', x: 300, y: 450 },
            { elementType: 'invasive_grass', x: 600, y: 600 },
            { elementType: 'invasive_grass', x: 900, y: 300 },
          ],
          durationSeconds: 90,
          objectives: [
            { id: 'fa_clear', text: 'Remove all invasives', condition: { type: 'remove_all_invasives' } },
            { id: 'fa_score', text: 'Score 15+ total', condition: { type: 'min_score', threshold: 15 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['fa_clear'] },
            twoStar: { objectives: ['fa_clear', 'fa_score'] },
            threeStar: { objectives: ['fa_clear', 'fa_score'], minScore: 28, minSynergies: 2 },
          },
        },
      ],
    },
    {
      id: 'it_ch2_rebuild',
      name: 'Rebuild & Defend',
      unlockStars: 3,
      missions: [
        {
          id: 'it_native_comeback',
          missionType: 'build',
          title: 'Native Comeback',
          narrative: 'The invasives are gone. Now build a resilient native ecosystem.',
          ecoLesson: 'After removing invasives, restoring native species prevents re-invasion by filling ecological niches.',
          budget: 8,
          actionLimit: 7,
          refundRate: 0.5,
          availableCategories: ['flowers', 'ground_cover', 'trees', 'shrubs'],
          startingPlacements: [],
          durationSeconds: 90,
          objectives: [
            { id: 'nc_pattern', text: 'Achieve Native Meadow pattern', condition: { type: 'pattern', patternName: 'Native Meadow' } },
            { id: 'nc_synergies', text: 'Create 2+ synergies', condition: { type: 'min_synergies', count: 2 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['nc_pattern'] },
            twoStar: { objectives: ['nc_pattern', 'nc_synergies'], minScore: 32 },
            threeStar: { objectives: ['nc_pattern', 'nc_synergies'], minScore: 45, noConflicts: true },
          },
        },
        {
          id: 'it_under_siege',
          missionType: 'survive',
          title: 'Under Siege',
          narrative: 'Build quickly — invasives will spawn at 40s and 80s! Can you maintain your ecosystem?',
          ecoLesson: 'Ongoing monitoring is crucial. Even after removal, invasive species can re-establish from seed banks or neighboring areas.',
          budget: 8,
          actionLimit: 8,
          refundRate: 0.5,
          availableCategories: ['flowers', 'ground_cover', 'trees', 'shrubs', 'water_features'],
          startingPlacements: [],
          durationSeconds: 120,
          midMissionEvents: [
            { eventType: 'invasive_spawn', triggerType: 'time', triggerTime: 40 },
            { eventType: 'invasive_spawn', triggerType: 'time', triggerTime: 80 },
          ],
          objectives: [
            { id: 'us_clear', text: 'End with no invasives', condition: { type: 'remove_all_invasives' } },
            { id: 'us_score', text: 'Score 25+ total', condition: { type: 'min_score', threshold: 25 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['us_score'] },
            twoStar: { objectives: ['us_clear', 'us_score'], minScore: 35 },
            threeStar: { objectives: ['us_clear', 'us_score'], minScore: 50, minSynergies: 3 },
          },
        },
      ],
    },
    {
      id: 'it_ch3_thrive',
      name: 'Thriving Ecosystem',
      unlockStars: 8,
      missions: [
        {
          id: 'it_woodland_edge',
          missionType: 'build',
          title: 'Woodland Edge',
          narrative: 'Create a natural forest edge — the most biodiverse habitat type in temperate regions.',
          ecoLesson: 'Forest edges where woodland meets open ground host the greatest species diversity — a concept called the "edge effect".',
          budget: 10,
          actionLimit: 8,
          refundRate: 0.5,
          availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'wildlife_habitat'],
          startingPlacements: [],
          durationSeconds: 90,
          objectives: [
            { id: 'we_pattern', text: 'Achieve Woodland Edge pattern', condition: { type: 'pattern', patternName: 'Woodland Edge' } },
            { id: 'we_score', text: 'Score 42+ total', condition: { type: 'min_score', threshold: 42 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['we_pattern'] },
            twoStar: { objectives: ['we_pattern', 'we_score'], minSynergies: 3 },
            threeStar: { objectives: ['we_pattern', 'we_score'], minScore: 55, minSynergies: 4, noConflicts: true },
          },
        },
        {
          id: 'it_final_stand',
          missionType: 'survive',
          title: 'Final Stand',
          narrative: 'The ultimate challenge: build a thriving ecosystem while surviving invasive spawns AND a budget cut!',
          ecoLesson: 'Real conservation faces multiple simultaneous threats. Success requires planning, adaptation, and understanding ecological relationships.',
          budget: 10,
          actionLimit: 10,
          refundRate: 0.5,
          availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat'],
          startingPlacements: [],
          durationSeconds: 120,
          midMissionEvents: [
            { eventType: 'invasive_spawn', triggerType: 'time', triggerTime: 40 },
            { eventType: 'budget_cut', triggerType: 'time', triggerTime: 70 },
          ],
          objectives: [
            { id: 'fs_clear', text: 'End with no invasives', condition: { type: 'remove_all_invasives' } },
            { id: 'fs_patterns', text: 'Achieve 2 ecosystem patterns', condition: { type: 'min_patterns', count: 2 } },
          ],
          starThresholds: {
            oneStar: { objectives: ['fs_clear'] },
            twoStar: { objectives: ['fs_clear', 'fs_patterns'], minScore: 42 },
            threeStar: { objectives: ['fs_clear', 'fs_patterns'], minScore: 65, minSynergies: 5, noConflicts: true },
          },
        },
      ],
    },
  ],
};

// === All Campaigns ===

export const CAMPAIGNS: Campaign[] = [GREENFIELD_PARK, INVASIVE_TAKEOVER_CAMPAIGN];

export function getCampaign(id: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

/**
 * Get a specific mission from a campaign by flattening all chapters.
 * roundNumber is 1-indexed (mission 1 = first mission in first chapter).
 */
export function getMissionFromCampaign(campaignId: string, roundNumber: number): MissionConfig | undefined {
  const campaign = getCampaign(campaignId);
  if (!campaign) return undefined;
  const allMissions = campaign.chapters.flatMap((ch) => ch.missions);
  return allMissions[roundNumber - 1];
}

/**
 * Get the total number of missions in a campaign.
 */
export function getTotalMissions(campaignId: string): number {
  const campaign = getCampaign(campaignId);
  if (!campaign) return 0;
  return campaign.chapters.reduce((sum, ch) => sum + ch.missions.length, 0);
}
