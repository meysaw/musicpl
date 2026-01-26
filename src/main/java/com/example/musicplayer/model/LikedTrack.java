package com.example.musicplayer.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "liked_tracks")
public class LikedTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "track_id", nullable = false)
    private String trackId;

    @Column(name = "track_name", nullable = false)
    private String trackName;

    @Column(name = "artist_name")
    private String artistName;

    @Column(name = "album_image")
    private String albumImage;

    @Column(name = "audio_url")
    private String audioUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "liked_at")
    private LocalDateTime likedAt;

    @PrePersist
    protected void onCreate() {
        likedAt = LocalDateTime.now();
    }

    public LikedTrack() {}

    public LikedTrack(String trackId, String trackName, String artistName, String albumImage, String audioUrl, User user) {
        this.trackId = trackId;
        this.trackName = trackName;
        this.artistName = artistName;
        this.albumImage = albumImage;
        this.audioUrl = audioUrl;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackId() { return trackId; }
    public void setTrackId(String trackId) { this.trackId = trackId; }

    public String getTrackName() { return trackName; }
    public void setTrackName(String trackName) { this.trackName = trackName; }

    public String getArtistName() { return artistName; }
    public void setArtistName(String artistName) { this.artistName = artistName; }

    public String getAlbumImage() { return albumImage; }
    public void setAlbumImage(String albumImage) { this.albumImage = albumImage; }

    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getLikedAt() { return likedAt; }
    public void setLikedAt(LocalDateTime likedAt) { this.likedAt = likedAt; }
}
