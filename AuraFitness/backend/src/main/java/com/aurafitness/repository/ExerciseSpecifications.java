package com.aurafitness.repository;

import com.aurafitness.entity.DifficultyLevel;
import com.aurafitness.entity.Exercise;
import com.aurafitness.entity.ExerciseEquipment;
import com.aurafitness.entity.MuscleGroup;
import org.springframework.data.jpa.domain.Specification;

public final class ExerciseSpecifications {

    private ExerciseSpecifications() {
    }

    public static Specification<Exercise> hasMuscleGroup(MuscleGroup muscleGroup) {
        return (root, query, criteriaBuilder) ->
                muscleGroup == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("muscleGroup"), muscleGroup);
    }

    public static Specification<Exercise> hasDifficulty(DifficultyLevel difficultyLevel) {
        return (root, query, criteriaBuilder) ->
                difficultyLevel == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("difficulty"), difficultyLevel);
    }

    public static Specification<Exercise> hasEquipment(ExerciseEquipment exerciseEquipment) {
        return (root, query, criteriaBuilder) ->
                exerciseEquipment == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("equipment"), exerciseEquipment);
    }

    public static Specification<Exercise> matchesSearch(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String normalizedSearch = "%" + search.trim().toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), normalizedSearch),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), normalizedSearch),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("instructions")), normalizedSearch)
            );
        };
    }
}
