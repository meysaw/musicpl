package com.example.musicplayer.service;

import com.example.musicplayer.dto.LoginRequest;
import com.example.musicplayer.dto.SignupRequest;
import com.example.musicplayer.dto.UserDto;
import com.example.musicplayer.model.User;
import com.example.musicplayer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public UserDto registerUser(SignupRequest signupRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Create new user
        User user = new User();
        user.setFullName(signupRequest.getFullName());
        user.setEmail(signupRequest.getEmail());
        
        // Hash password with BCrypt
        String hashedPassword = passwordEncoder.encode(signupRequest.getPassword());
        user.setPassword(hashedPassword);
        
        // Save user to database
        User savedUser = userRepository.save(user);
        
        // Return UserDto (without password)
        return new UserDto(savedUser.getId(), savedUser.getFullName(), savedUser.getEmail());
    }
    
    public UserDto authenticateUser(LoginRequest loginRequest) {
        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }
        
        User user = userOptional.get();
        
        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        // Return UserDto (without password)
        return new UserDto(user.getId(), user.getFullName(), user.getEmail());
    }
}
