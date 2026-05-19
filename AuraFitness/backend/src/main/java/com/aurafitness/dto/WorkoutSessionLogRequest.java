package com.aurafitness.dto;

import java.util.ArrayList;
import java.util.List;

public class WorkoutSessionLogRequest {

    private List<WorkoutSetLogDto> sets = new ArrayList<>();

    public List<WorkoutSetLogDto> getSets() {
        return sets;
    }

    public void setSets(List<WorkoutSetLogDto> sets) {
        this.sets = sets;
    }
}
