package com.example.musicplayer.repository;

import com.example.musicplayer.model.LikedTrack;
import com.example.musicplayer.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikedTrackRepository extends JpaRepository<LikedTrack, Long> {
    List<LikedTrack> findByUserOrderByLikedAtDesc(User user);
    Optional<LikedTrack> findByUserAndTrackId(User user, String trackId);
    void deleteByUserAndTrackId(User user, String trackId);
}
