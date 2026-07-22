package com.librario.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "membership_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PlanType type;

    private Double fees;
    private Integer borrowingLimit;
    private Integer duration; // days

    public String getName() {
        return type != null ? type.name() : "Unknown Plan";
    }



    public enum PlanType {
        BASIC, PREMIUM
    }
}
