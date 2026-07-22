package com.librario.service;

import com.librario.dto.UserDTO;
import com.librario.model.Member;
import java.util.List;

public interface MemberService {
    Member assignMembership(Long userId, Long planId);
    Member updateMembership(Long memberId, Long planId);
    void deleteMembership(Long memberId);
    List<Member> getAllMembers();
    List<String> getBorrowingHistory(Long memberId);
    Member getMemberById(Long memberId);
    Member addMember(UserDTO userDTO, Long planId);



    Member renewMembership(Long memberId);


}
