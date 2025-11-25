package com.autric.upbit.domain.upbitApiKey;

import com.autric.upbit.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor
public class UpbitApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "api_key_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", unique = true)
    @ToString.Exclude
    private Member member;

    @Column(name = "access_key", nullable = false)
    private String accessKey;

    @Column(name = "secret_key", nullable = false)
    private String secretKey;

    @Builder
    public UpbitApiKey(Member member, String accessKey, String secretKey) {
        this.member = member;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }

    public void changeMember(Member member) {
        this.member = member;
    }
}
