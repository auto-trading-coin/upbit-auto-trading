package com.autric.upbit.domain.upbitApiKey;

import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.global.util.CryptoConverter;
import com.autric.upbit.global.util.HashUtil;
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
    @Convert(converter = CryptoConverter.class)
    private String accessKey;

    @Column(name = "secret_key", nullable = false)
    @Convert(converter = CryptoConverter.class)
    private String secretKey;

    @Column(name = "access_key_hash", nullable = false, unique = true)
    private String accessKeyHash;

    @Builder
    public UpbitApiKey(Member member, String accessKey, String secretKey) {
        this.member = member;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.accessKeyHash = HashUtil.sha256(accessKey);
    }

    public void changeMember(Member member) {
        this.member = member;
    }
}
