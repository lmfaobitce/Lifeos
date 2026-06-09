import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding exercise library...");

  const exercises = [
    // PUSH — Chest
    { name: "Incline Barbell Press", muscleGroup: "chest", secondaryMuscles: ["front_delt", "triceps"], equipment: ["Barbells", "Adjustable Benches"], instructions: "Set bench to 30-45 degrees. Grip slightly wider than shoulder width. Lower bar to upper chest, press explosively.", difficulty: "intermediate" },
    { name: "Flat Barbell Bench Press", muscleGroup: "chest", secondaryMuscles: ["front_delt", "triceps"], equipment: ["Barbells", "Adjustable Benches"], instructions: "Lie flat, arch slightly, retract scapula. Lower bar to mid-chest, drive up.", difficulty: "intermediate" },
    { name: "Incline Dumbbell Press", muscleGroup: "chest", secondaryMuscles: ["front_delt", "triceps"], equipment: ["Dumbbells", "Adjustable Benches"], instructions: "Set bench to 30-45 degrees. Press dumbbells up and slightly inward at top.", difficulty: "beginner" },
    { name: "Machine Chest Press", muscleGroup: "chest", secondaryMuscles: ["front_delt", "triceps"], equipment: ["Chest Press Machine"], instructions: "Adjust seat so handles are at mid-chest. Press forward, control the return.", difficulty: "beginner" },
    { name: "Cable Crossover Low to High", muscleGroup: "chest", secondaryMuscles: ["front_delt"], equipment: ["Cable Machines"], instructions: "Set cables low. Pull upward and across, squeezing upper chest at peak.", difficulty: "intermediate" },
    { name: "Smith Machine Incline Press", muscleGroup: "chest", secondaryMuscles: ["front_delt", "triceps"], equipment: ["Smith Machine", "Adjustable Benches"], instructions: "Set bench at 30 degrees under smith. Unrack, lower to upper chest, press.", difficulty: "beginner" },
    { name: "Dumbbell Flat Press", muscleGroup: "chest", secondaryMuscles: ["front_delt", "triceps"], equipment: ["Dumbbells", "Adjustable Benches"], instructions: "Lie flat. Press dumbbells up, touch at top, lower with control.", difficulty: "beginner" },

    // PUSH — Shoulders
    { name: "Seated Dumbbell Shoulder Press", muscleGroup: "shoulders", secondaryMuscles: ["triceps", "upper_chest"], equipment: ["Dumbbells", "Adjustable Benches"], instructions: "Sit upright. Press dumbbells from ear height to overhead, don't lock out.", difficulty: "intermediate" },
    { name: "Barbell Overhead Press", muscleGroup: "shoulders", secondaryMuscles: ["triceps", "upper_chest"], equipment: ["Barbells"], instructions: "Standing or seated. Press bar from collarbone to overhead, keep core tight.", difficulty: "intermediate" },
    { name: "Cable Lateral Raise", muscleGroup: "shoulders", secondaryMuscles: [], equipment: ["Cable Machines"], instructions: "Stand side-on to cable set low. Raise arm out to shoulder height, lead with elbow.", difficulty: "beginner" },
    { name: "Dumbbell Lateral Raise", muscleGroup: "shoulders", secondaryMuscles: [], equipment: ["Dumbbells"], instructions: "Slight forward lean. Raise dumbbells to shoulder height, lead with elbows, pinky slightly up.", difficulty: "beginner" },
    { name: "Cable Rear Delt Fly", muscleGroup: "shoulders", secondaryMuscles: ["upper_back"], equipment: ["Cable Machines"], instructions: "Set cables high, cross arms. Pull apart with straight arms, squeeze rear delts.", difficulty: "beginner" },
    { name: "Dumbbell Rear Delt Fly", muscleGroup: "shoulders", secondaryMuscles: ["upper_back"], equipment: ["Dumbbells", "Adjustable Benches"], instructions: "Lean forward on bench. Raise dumbbells out to sides, lead with elbows.", difficulty: "beginner" },
    { name: "Face Pull", muscleGroup: "shoulders", secondaryMuscles: ["upper_back", "biceps"], equipment: ["Cable Machines"], instructions: "Set cable at face height with rope. Pull to face, flare elbows out, external rotate.", difficulty: "beginner" },

    // PUSH — Triceps
    { name: "Cable Tricep Pushdown", muscleGroup: "triceps", secondaryMuscles: [], equipment: ["Cable Machines"], instructions: "Use bar or rope attachment. Keep elbows tucked, push down to full extension.", difficulty: "beginner" },
    { name: "Overhead Cable Tricep Extension", muscleGroup: "triceps", secondaryMuscles: [], equipment: ["Cable Machines"], instructions: "Set cable low with rope. Face away, extend overhead, keep elbows close to head.", difficulty: "beginner" },
    { name: "Skull Crushers", muscleGroup: "triceps", secondaryMuscles: [], equipment: ["Barbells", "Adjustable Benches"], instructions: "Lie flat. Lower bar to forehead by bending elbows only, extend back up.", difficulty: "intermediate" },
    { name: "Dumbbell Overhead Tricep Extension", muscleGroup: "triceps", secondaryMuscles: [], equipment: ["Dumbbells"], instructions: "Hold one dumbbell overhead with both hands. Lower behind head, extend up.", difficulty: "beginner" },

    // PULL — Back
    { name: "Wide Grip Lat Pulldown", muscleGroup: "back", secondaryMuscles: ["biceps", "rear_delt"], equipment: ["Lat Pulldown"], instructions: "Grip wide, lean back slightly. Pull bar to upper chest, lead with elbows.", difficulty: "beginner" },
    { name: "Close Grip Lat Pulldown", muscleGroup: "back", secondaryMuscles: ["biceps"], equipment: ["Lat Pulldown"], instructions: "Use V-bar. Pull to chest, squeeze lats at bottom, control return.", difficulty: "beginner" },
    { name: "Straight Arm Pulldown", muscleGroup: "back", secondaryMuscles: [], equipment: ["Cable Machines"], instructions: "Set cable high. With straight arms pull bar down to thighs, squeeze lats.", difficulty: "beginner" },
    { name: "Seated Cable Row", muscleGroup: "back", secondaryMuscles: ["biceps", "rear_delt"], equipment: ["Seated Row"], instructions: "Sit upright. Pull handle to abdomen, drive elbows back, squeeze shoulder blades.", difficulty: "beginner" },
    { name: "Barbell Bent Over Row", muscleGroup: "back", secondaryMuscles: ["biceps", "rear_delt"], equipment: ["Barbells"], instructions: "Hinge at hips 45 degrees. Pull bar to lower chest, lead with elbows.", difficulty: "intermediate" },
    { name: "Dumbbell Single Arm Row", muscleGroup: "back", secondaryMuscles: ["biceps"], equipment: ["Dumbbells", "Adjustable Benches"], instructions: "Support with one hand on bench. Pull dumbbell to hip, drive elbow up and back.", difficulty: "beginner" },
    { name: "Pull-Ups", muscleGroup: "back", secondaryMuscles: ["biceps"], equipment: ["Pull-Up Station"], instructions: "Dead hang. Pull chest to bar, lead with elbows. Full range of motion.", difficulty: "intermediate" },
    { name: "Chin-Ups", muscleGroup: "back", secondaryMuscles: ["biceps"], equipment: ["Pull-Up Station"], instructions: "Supinated grip, shoulder width. Pull chin over bar, squeeze biceps at top.", difficulty: "intermediate" },
    { name: "Smith Machine Row", muscleGroup: "back", secondaryMuscles: ["biceps", "rear_delt"], equipment: ["Smith Machine"], instructions: "Hinge forward under bar. Pull bar to abdomen, squeeze at top.", difficulty: "beginner" },

    // PULL — Biceps
    { name: "Barbell Curl", muscleGroup: "biceps", secondaryMuscles: ["forearms"], equipment: ["Barbells"], instructions: "Stand upright. Curl bar to shoulder height, squeeze, lower with control.", difficulty: "beginner" },
    { name: "Dumbbell Curl", muscleGroup: "biceps", secondaryMuscles: ["forearms"], equipment: ["Dumbbells"], instructions: "Alternate or together. Curl with supination, squeeze at top.", difficulty: "beginner" },
    { name: "Incline Dumbbell Curl", muscleGroup: "biceps", secondaryMuscles: ["forearms"], equipment: ["Dumbbells", "Adjustable Benches"], instructions: "Set bench to 60 degrees. Arms hang back. Curl up, full stretch at bottom.", difficulty: "beginner" },
    { name: "Cable Curl", muscleGroup: "biceps", secondaryMuscles: ["forearms"], equipment: ["Cable Machines"], instructions: "Set cable low. Curl bar or rope to chin, keep elbows fixed.", difficulty: "beginner" },
    { name: "Hammer Curl", muscleGroup: "biceps", secondaryMuscles: ["forearms", "brachialis"], equipment: ["Dumbbells"], instructions: "Neutral grip. Curl to shoulder height without rotating wrist.", difficulty: "beginner" },
    { name: "EZ Bar Curl", muscleGroup: "biceps", secondaryMuscles: ["forearms"], equipment: ["Barbells"], instructions: "Use EZ bar attachment. Curl to chin, keep elbows tucked.", difficulty: "beginner" },
    { name: "Concentration Curl", muscleGroup: "biceps", secondaryMuscles: [], equipment: ["Dumbbells"], instructions: "Seated, elbow on inner thigh. Curl dumbbell to shoulder, full squeeze.", difficulty: "beginner" },
    { name: "Cable Hammer Curl", muscleGroup: "biceps", secondaryMuscles: ["brachialis"], equipment: ["Cable Machines"], instructions: "Rope attachment, cable low. Curl with neutral grip to chin.", difficulty: "beginner" },

    // LEGS
    { name: "Barbell Squat", muscleGroup: "quads", secondaryMuscles: ["glutes", "hamstrings"], equipment: ["Barbells"], instructions: "Bar on traps. Feet shoulder width. Squat to parallel or below, drive through heels.", difficulty: "intermediate" },
    { name: "Smith Machine Squat", muscleGroup: "quads", secondaryMuscles: ["glutes", "hamstrings"], equipment: ["Smith Machine"], instructions: "Feet slightly forward. Squat to parallel, keep knees tracking toes.", difficulty: "beginner" },
    { name: "Leg Press", muscleGroup: "quads", secondaryMuscles: ["glutes", "hamstrings"], equipment: ["Leg Press"], instructions: "Feet shoulder width mid-platform. Lower to 90 degrees, press through heels.", difficulty: "beginner" },
    { name: "Hack Squat", muscleGroup: "quads", secondaryMuscles: ["glutes"], equipment: ["Hack Squat"], instructions: "Feet mid-platform. Lower until thighs parallel, drive through heels.", difficulty: "intermediate" },
    { name: "Dumbbell Romanian Deadlift", muscleGroup: "hamstrings", secondaryMuscles: ["glutes", "lower_back"], equipment: ["Dumbbells"], instructions: "Hinge at hips, slight knee bend. Lower dumbbells along legs, feel hamstring stretch.", difficulty: "intermediate" },
    { name: "Barbell Romanian Deadlift", muscleGroup: "hamstrings", secondaryMuscles: ["glutes", "lower_back"], equipment: ["Barbells"], instructions: "Hinge at hips. Lower bar along legs to mid-shin, drive hips forward to stand.", difficulty: "intermediate" },
    { name: "Leg Press Calf Raise", muscleGroup: "calves", secondaryMuscles: [], equipment: ["Leg Press"], instructions: "Place toes on edge of platform. Full range calf press, pause at stretch.", difficulty: "beginner" },
    { name: "Dumbbell Lunge", muscleGroup: "quads", secondaryMuscles: ["glutes", "hamstrings"], equipment: ["Dumbbells"], instructions: "Step forward, lower back knee toward floor. Keep torso upright.", difficulty: "beginner" },
    { name: "Cable Pull Through", muscleGroup: "hamstrings", secondaryMuscles: ["glutes"], equipment: ["Cable Machines"], instructions: "Set cable low. Stand facing away, hinge forward pulling cable between legs, drive hips forward.", difficulty: "beginner" },

    // ARMS
    { name: "Tricep Dips", muscleGroup: "triceps", secondaryMuscles: ["chest", "front_delt"], equipment: ["Pull-Up Station"], instructions: "Use parallel bars. Lower until elbows 90 degrees, press up keeping torso upright.", difficulty: "intermediate" },
    { name: "Smith Machine Close Grip Press", muscleGroup: "triceps", secondaryMuscles: ["chest"], equipment: ["Smith Machine", "Adjustable Benches"], instructions: "Grip shoulder width. Lower to chest, drive elbows close to body throughout.", difficulty: "intermediate" },
    { name: "Cable Overhead Tricep Extension", muscleGroup: "triceps", secondaryMuscles: [], equipment: ["Cable Machines"], instructions: "Rope attachment, cable low. Face away, extend arms overhead keeping elbows close.", difficulty: "beginner" },

    // CORE
    { name: "Cable Crunch", muscleGroup: "core", secondaryMuscles: [], equipment: ["Cable Machines"], instructions: "Kneel facing cable set high with rope. Pull down crunching elbows to knees, squeeze abs.", difficulty: "beginner" },
    { name: "Hanging Leg Raise", muscleGroup: "core", secondaryMuscles: ["hip_flexors"], equipment: ["Pull-Up Station"], instructions: "Dead hang. Raise legs to 90 degrees keeping them straight, lower with control.", difficulty: "intermediate" },
    { name: "Hanging Knee Raise", muscleGroup: "core", secondaryMuscles: ["hip_flexors"], equipment: ["Pull-Up Station"], instructions: "Dead hang. Pull knees to chest, squeeze abs at top, lower slowly.", difficulty: "beginner" },
    { name: "Ab Wheel Rollout", muscleGroup: "core", secondaryMuscles: ["lower_back", "shoulders"], equipment: ["Barbells"], instructions: "Use barbell with plates. Roll forward keeping core tight, pull back using abs.", difficulty: "advanced" },
    { name: "Cable Woodchop", muscleGroup: "core", secondaryMuscles: ["shoulders"], equipment: ["Cable Machines"], instructions: "Set cable high. Pull diagonally across body to opposite hip, rotate torso.", difficulty: "beginner" },
    { name: "Plank", muscleGroup: "core", secondaryMuscles: ["shoulders", "glutes"], equipment: [], instructions: "Forearms on floor, body straight. Hold position, breathe normally, don't let hips drop.", difficulty: "beginner" },
    { name: "Decline Sit-Up", muscleGroup: "core", secondaryMuscles: [], equipment: ["Adjustable Benches"], instructions: "Lock feet on decline bench. Sit up fully, lower with control, don't use momentum.", difficulty: "beginner" },
  ];

  for (const exercise of exercises) {
    const id = exercise.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    await prisma.exercise.upsert({
      where: { id },
      update: exercise,
      create: { ...exercise, id },
    });
  }

  console.log(`Seeded ${exercises.length} exercises.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
