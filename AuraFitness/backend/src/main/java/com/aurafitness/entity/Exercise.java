package com.aurafitness.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "exercises")
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "muscle_group", nullable = false, length = 50)
    private MuscleGroup muscleGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExerciseEquipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DifficultyLevel difficulty;

    @Lob
    private String description;

    @Lob
    @Column(nullable = false)
    private String instructions;

    @Column(length = 1000)
    private String imageUrl;

    @Column(length = 1000)
    private String videoUrl;

    public Exercise() {}

    public Exercise(String name, String muscleGroup, String description) {
        this.name = name;
        this.muscleGroup = MuscleGroup.fromValue(muscleGroup);
        this.description = description;
        this.equipment = ExerciseEquipment.BODYWEIGHT;
        this.difficulty = DifficultyLevel.BEGINNER;
        this.instructions = "";
    }

    public Exercise(
            String name,
            MuscleGroup muscleGroup,
            ExerciseEquipment equipment,
            DifficultyLevel difficulty,
            String description,
            String instructions,
            String imageUrl,
            String videoUrl) {
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.equipment = equipment;
        this.difficulty = difficulty;
        this.description = description;
        this.instructions = instructions;
        this.imageUrl = imageUrl;
        this.videoUrl = videoUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public MuscleGroup getMuscleGroup() { return muscleGroup; }
    public void setMuscleGroup(MuscleGroup muscleGroup) { this.muscleGroup = muscleGroup; }
    public ExerciseEquipment getEquipment() { return equipment; }
    public void setEquipment(ExerciseEquipment equipment) { this.equipment = equipment; }
    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
}
