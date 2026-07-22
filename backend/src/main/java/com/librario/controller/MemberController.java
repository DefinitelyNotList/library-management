package com.librario.controller;

import com.librario.dto.UserDTO;
import com.librario.model.Member;
import com.librario.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/assign/{userId}/{planId}")
    public Member assignMembership(@PathVariable Long userId, @PathVariable Long planId) {
        return memberService.assignMembership(userId, planId);
    }

    @PutMapping("/{memberId}/update/{planId}")
    public Member updateMembership(@PathVariable Long memberId, @PathVariable Long planId) {
        return memberService.updateMembership(memberId, planId);
    }

    @DeleteMapping("/{memberId}")
    public void deleteMembership(@PathVariable Long memberId) {
        memberService.deleteMembership(memberId);
    }

    @GetMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    @GetMapping("/{memberId}/history")
    public List<String> getBorrowingHistory(@PathVariable Long memberId) {
        return memberService.getBorrowingHistory(memberId);
    }

    // New Renewal end point
    @PutMapping("/{memberId}/renew")
    public Member renewMembership(@PathVariable Long memberId) {
        return memberService.renewMembership(memberId);
    }

    @GetMapping("/{memberId}")
    public Member getMemberById(@PathVariable Long memberId) {
        return memberService.getMemberById(memberId);
    }

    @PostMapping("/add/{planId}")
    public Member addMember(@RequestBody UserDTO userDTO, @PathVariable Long planId) {
        return memberService.addMember(userDTO, planId);
    }



}
