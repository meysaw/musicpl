package com.example.musicplayer.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootContoller {
    @GetMapping("/")
    public String index() {
        return "redirect:/home.html";
    }
}