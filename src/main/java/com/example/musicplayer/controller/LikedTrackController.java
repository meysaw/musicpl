package com.example.musicplayer.controller;

import com.example.musicplayer.model.LikedTrack;
import com.example.musicplayer.model.User;
import com.example.musicplayer.repository.LikedTrackRepository;
import com.example.musicplayer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/library")
@CrossOrigin(origins = "*")
public class LikedTrackController {

    @Autowired
    private LikedTrackRepository likedTrackRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<List<LikedTrack>> getLikedTracks(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(likedTrackRepository.findByUserOrderByLikedAtDesc(userOpt.get()));
    }

    @PostMapping("/like")
    public ResponseEntity<?> likeTrack(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String trackId = payload.get("trackId").toString();
        String trackName = payload.get("trackName").toString();
        String artistName = payload.get("artistName").toString();
        String albumImage = payload.get("albumImage").toString();
        String audioUrl = payload.get("audioUrl").toString();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOpt.get();
        Optional<LikedTrack> existing = likedTrackRepository.findByUserAndTrackId(user, trackId);
        
        if (existing.isPresent()) {
            return ResponseEntity.ok("Already liked");
        }

        LikedTrack likedTrack = new LikedTrack(trackId, trackName, artistName, albumImage, audioUrl, user);
        likedTrackRepository.save(likedTrack);
        
        return ResponseEntity.ok("Track liked successfully");
    }

    @DeleteMapping("/unlike")
    @Transactional
    public ResponseEntity<?> unlikeTrack(@RequestParam Long userId, @RequestParam String trackId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        likedTrackRepository.deleteByUserAndTrackId(userOpt.get(), trackId);
        return ResponseEntity.ok("Track unliked successfully");
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> isLiked(@RequestParam Long userId, @RequestParam String trackId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(false);
        }

        Optional<LikedTrack> existing = likedTrackRepository.findByUserAndTrackId(userOpt.get(), trackId);
        return ResponseEntity.ok(existing.isPresent());
    }
}
