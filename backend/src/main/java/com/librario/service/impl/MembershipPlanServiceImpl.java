package com.librario.service.impl;

import com.librario.model.MembershipPlan;
import com.librario.repository.MembershipPlanRepository;
import com.librario.service.MembershipPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MembershipPlanServiceImpl implements MembershipPlanService {

    private final MembershipPlanRepository planRepository;

    @Override
    public MembershipPlan createPlan(MembershipPlan plan) {
        return planRepository.save(plan);
    }

    @Override
    public MembershipPlan updatePlan(Long id, MembershipPlan updatedPlan) {
        MembershipPlan existingPlan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));
        existingPlan.setType(updatedPlan.getType());
        existingPlan.setFees(updatedPlan.getFees());
        existingPlan.setBorrowingLimit(updatedPlan.getBorrowingLimit());
        existingPlan.setDuration(updatedPlan.getDuration());
        return planRepository.save(existingPlan);
    }

    @Override
    public void deletePlan(Long id) {
        planRepository.deleteById(id);
    }

    @Override
    public List<MembershipPlan> getAllPlans() {
        return planRepository.findAll();
    }
}
