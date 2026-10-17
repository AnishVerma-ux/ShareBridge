package com.foodbridge.service;

import java.util.List;
import java.util.Optional;

import com.foodbridge.security.JwtService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.foodbridge.dto.LoginRequest;
import com.foodbridge.entity.User;
import com.foodbridge.enums.Role;
import com.foodbridge.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User getUserByEmail(String email){
        Optional<User> user = userRepository.findByEmail(email);
        if(user.isEmpty()){
            throw new IllegalArgumentException("User not found.");
        }
        return user.get();
    }

    // Register User
    public User registerUser(User user) {
        if (user.getRole() == null || user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Choose a valid public role. Administrator accounts cannot be registered publicly.");
        }
        if (user.getEmail() == null || user.getEmail().isBlank() || user.getPassword() == null || user.getPassword().length() < 8) {
            throw new IllegalArgumentException("A valid email and password of at least 8 characters are required.");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Login User
    public String loginUser(LoginRequest loginRequest) {

        Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());

        if (user.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        User existingUser = user.get();

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                existingUser.getPassword())) {

            throw new IllegalArgumentException("Invalid email or password.");
        }

        // After successful authentication, generate a JWT and return it to the client.
        // The client will send this JWT with every protected request.
        return jwtService.generateToken(existingUser);
    }
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    public User getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(User updatedUser) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedUser.getFullName() != null) user.setFullName(updatedUser.getFullName().trim());
        if (updatedUser.getPhoneNumber() != null) user.setPhoneNumber(updatedUser.getPhoneNumber().trim());
        if (updatedUser.getAddress() != null) user.setAddress(updatedUser.getAddress().trim());

        return userRepository.save(user);
    }
}