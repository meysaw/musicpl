
package com.example.musicplayer.controller;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;


@RestController
@RequestMapping("/api/download")
public class JamendoDownloadController {

    @GetMapping("/jamendo")
    public ResponseEntity<Void> download(@RequestParam Long trackId) {

        String jamendoUrl =
            "https://api.jamendo.com/v3.0/tracks/file" +
                "?client_id=841052ed" +
                "&id=" + trackId +
                "&audioformat=mp32";

        return ResponseEntity
                .status(302)
                .header(HttpHeaders.LOCATION, jamendoUrl)
                .build();
    }
}
