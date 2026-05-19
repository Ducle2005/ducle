package com.aurafitness.dto;

public class AuthUserDto {

    private String email;
    private String name;
    private String avatarUrl;
    private java.util.Set<String> roles;

    public AuthUserDto() {
    }

    public AuthUserDto(String email, String name, String avatarUrl) {
        this.email = email;
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    public AuthUserDto(String email, String name, String avatarUrl, java.util.Set<String> roles) {
        this.email = email;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.roles = roles;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public java.util.Set<String> getRoles() {
        return roles;
    }

    public void setRoles(java.util.Set<String> roles) {
        this.roles = roles;
    }
}
