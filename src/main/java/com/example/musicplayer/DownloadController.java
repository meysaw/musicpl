package com.example.musicplayer;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.InputStream;

@RestController
public class DownloadController {

    @GetMapping("/api/download")
    public ResponseEntity<StreamingResponseBody> downloadAudio(@RequestParam String url) {
        StreamingResponseBody stream = outputStream -> {
            try {
                // Command: yt-dlp -x --audio-format mp3 -o - {url}
                // -o - writes to stdout
                ProcessBuilder pb = new ProcessBuilder(
                    "yt-dlp",
                    "-x",
                    "--audio-format", "mp3",
                    "-o", "-",
                    url
                );
                
                Process process = pb.start();
                InputStream inputStream = process.getInputStream();
                
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                
                process.waitFor();
            } catch (Exception e) {
                e.printStackTrace();
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"music.mp3\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM) // Or "audio/mpeg"
                .body(stream);
    }
}
