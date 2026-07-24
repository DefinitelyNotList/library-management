package com.librario.service.impl;

import com.librario.dto.UserDTO;
import com.librario.model.Member;
import com.librario.model.MembershipPlan;
import com.librario.model.Role;
import com.librario.model.User;
import com.librario.repository.MemberRepository;
import com.librario.repository.MembershipPlanRepository;
import com.librario.repository.RoleRepository;
import com.librario.repository.UserRepository;
import com.librario.service.MemberService;
import com.librario.service.EmailService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final MembershipPlanRepository planRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public Member assignMembership(Long userId, Long planId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));

        Member member = new Member();
        member.setUser(user);
        member.setMembershipPlan(plan);
        member.setStartDate(LocalDate.now());
        member.setEndDate(LocalDate.now().plusDays(plan.getDuration()));
        member.setStatus(Member.Status.ACTIVE);

        Member savedMember = memberRepository.save(member);

        // Send email
        emailService.sendEmail(
                user.getEmail(),
                "Membership Assigned",
                "Hello " + user.getName() + ",\n\nYou have been assigned the '"
                        + plan.getName() + "' membership plan.\nYour membership is valid until "
                        + savedMember.getEndDate() + "."
        );

        return savedMember;
    }

    @Override
    public Member updateMembership(Long memberId, Long planId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));
        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));

        member.setMembershipPlan(plan);
        member.setEndDate(LocalDate.now().plusDays(plan.getDuration()));
        member.setStatus(Member.Status.ACTIVE);

        return memberRepository.save(member);
    }

    @Override
    public void deleteMembership(Long memberId) {
        memberRepository.deleteById(memberId);
    }

    @Override
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    @Override
    public List<String> getBorrowingHistory(Long memberId) {
        // Placeholder - will integrate with issued books later
        return List.of("Borrowing history not implemented yet");
    }


    @Override
    public Member renewMembership(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));

        MembershipPlan plan = member.getMembershipPlan();
        if (plan == null) {
            throw new RuntimeException("Membership plan not assigned for member id: " + memberId);
        }

        LocalDate currentEndDate = member.getEndDate();
        LocalDate newEndDate = (currentEndDate.isAfter(LocalDate.now()) ? currentEndDate : LocalDate.now())
                .plusDays(plan.getDuration());
        member.setEndDate(newEndDate);
        member.setStatus(Member.Status.ACTIVE);

        return memberRepository.save(member);
    }

    @Override
    public Member getMemberById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));
    }

    @Override
    public Member addMember(UserDTO userDTO, Long planId) {
        // 1 Fetch the MEMBER role from DB
        Role memberRole = new Role(null, "MEMBER");

        //  Create new user
        User user = new User();
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());

        // 2 Generate a temporary password
        String tempPassword = "Temp@" + ((int)(Math.random() * 10000));
        user.setPassword(passwordEncoder.encode(tempPassword)); // secure storage
        user.setRole(memberRole); // assign the Role entity
        user.setStatus(true);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // 3 Assign membership plan
        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));

        Member member = new Member();
        member.setUser(savedUser);
        member.setMembershipPlan(plan);
        member.setStartDate(LocalDate.now());
        member.setEndDate(LocalDate.now().plusDays(plan.getDuration()));
        member.setStatus(Member.Status.ACTIVE);

        Member savedMember = memberRepository.save(member);

        // 4 Send HTML welcome email with Reset Password button
        String resetLink = "http://localhost:5173/forgot-password"; // your frontend reset password route
        String emailContent = "<html>" +
                "<body>" +
                "<p>Hello " + savedUser.getName() + ",</p>" +
                "<p>Your account has been created by the admin and assigned the '<strong>" + plan.getName() + "</strong>' plan.</p>" +
                "<p><strong>Email:</strong> " + savedUser.getEmail() + "<br/>" +
                "<strong>Temporary Password:</strong> " + tempPassword + "</p>" +
                "<p>Please reset your password by clicking the button below:</p>" +
                "<a href='" + resetLink + "' style='" +
                "display:inline-block; padding:10px 20px; font-size:16px; " +
                "color:white; background-color:#007bff; text-decoration:none; border-radius:5px;'>Reset Your Password</a>" +
                "<p>Thank you,<br/>Librario Team</p>" +
                "</body>" +
                "</html>";

        emailService.sendHtmlEmail(savedUser.getEmail(), "Welcome to Librario - Reset Your Password", emailContent);

        return savedMember;
    }

}
