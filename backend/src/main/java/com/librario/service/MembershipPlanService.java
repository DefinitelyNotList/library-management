package com.librario.service;

import com.librario.model.MembershipPlan;
import java.util.List;

public interface MembershipPlanService {
    MembershipPlan createPlan(MembershipPlan plan);
    MembershipPlan updatePlan(Long id, MembershipPlan plan);
    void deletePlan(Long id);
    List<MembershipPlan> getAllPlans();
}
