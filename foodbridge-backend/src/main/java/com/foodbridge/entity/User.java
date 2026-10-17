package com.foodbridge.entity;

import com.foodbridge.enums.Role;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Data
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String address;
    private String organizationName;

    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority(role.name());

        return List.of(authority);
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

/*
Abhi tak hamara user authenticated hai, matlab Spring Security ko pata hai ki user valid hai,
lekin Spring ko abhi ye nahi pata ki user ka role kya hai, jaise ADMIN, DONOR ya NGO,
jiske basis par hum user ko authorize kar sakein.

Hamara User ek normal Java class hai jisme user ki information jaise email, password aur role stored hai,
lekin Spring Security ko automatically nahi pata ki in fields se security-related information kaise leni hai.

Isliye hum User class mein UserDetails interface implement karte hain.
Isse hum Spring Security ko ek standard way provide karte hain jisse wo hamare User object se username,
password aur authorities jaisi information le sake.

UserDetails mein getAuthorities() method hota hai jo Collection<? extends GrantedAuthority> return karta hai,
matlab hum List, Set etc. return kar sakte hain jiske andar GrantedAuthority type ke objects honge.

Hamare User class mein already Role enum hai jo batata hai ki user ADMIN, DONOR ya NGO hai,
lekin Spring Security hamare custom Role enum ko directly authorization ke liye use nahi karta.

Spring Security roles/permissions ko GrantedAuthority interface ke through represent karta hai.
Kyunki GrantedAuthority ek interface hai, hum directly iska object nahi banate.

Isliye Spring Security hume SimpleGrantedAuthority naam ki ready-made class deta hai jo GrantedAuthority ko
implement karti hai.

Hum apne Role ko SimpleGrantedAuthority ke object mein convert/wrap karke Spring Security
ko user ki authority provide karte hain.
*/