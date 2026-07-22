package com.librario.controller;

import com.librario.model.MembershipPlan;
import com.librario.service.MembershipPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership/plans")
@RequiredArgsConstructor
public class MembershipPlanController {

    private final MembershipPlanService planService;

    @PostMapping
    public MembershipPlan createPlan(@RequestBody MembershipPlan plan) {
        return planService.createPlan(plan);
    }

    @GetMapping
    public List<MembershipPlan> getPlans() {
        return planService.getAllPlans();
    }

    @PutMapping("/{id}")
    public MembershipPlan updatePlan(@PathVariable Long id, @RequestBody MembershipPlan plan) {
        return planService.updatePlan(id, plan);
    }

    @DeleteMapping("/{id}")
    public void deletePlan(@PathVariable Long id) {
        planService.deletePlan(id);
    }
}
